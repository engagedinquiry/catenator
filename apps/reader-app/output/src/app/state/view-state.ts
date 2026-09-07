import { computed, inject, Injectable, signal } from '@angular/core';
import { deliver, DeliveryResult } from '../core/delivery';
import { FolderBrowser } from '../core/folder-browser';

export type ViewName = 'home' | 'categoryList' | 'fileList' | 'content';

/**
 * view.state — the whole app navigation, one in-memory state machine. No Angular
 * Router, no URL, no markdown-link parsing (view.state mustNever). Every
 * transition is a direct assignment from a click handler.
 *
 * micro.single-state-variable: `current` holds the active view; `activeRoot`,
 * `selectedCategory`, `selectedFile` accumulate as the reader drills down.
 * micro.back-navigation-is-explicit-controls: goHome / backToCategories /
 * backToFiles / switchCategory (the dropdown) are the only ways back.
 */
@Injectable({ providedIn: 'root' })
export class ViewState {
  readonly browser = inject(FolderBrowser);

  readonly current = signal<ViewName>('home');
  readonly activeRoot = signal<string | null>(null);
  readonly selectedCategory = signal<string | null>(null);
  readonly selectedFile = signal<string | null>(null);

  readonly loading = signal(false);
  readonly result = signal<DeliveryResult | null>(null);

  /** home state: docs/README.md, rendered via the same folder-browser mechanism. */
  readonly homeResult = signal<DeliveryResult | null>(null);

  readonly categories = computed(() => {
    const r = this.activeRoot();
    return r ? this.browser.categories(r) : [];
  });
  readonly files = computed(() => {
    const r = this.activeRoot();
    const c = this.selectedCategory();
    return r && c ? this.browser.files(r, c) : [];
  });

  /** view.state fileList/content: sibling categories under the current root. */
  readonly siblingCategories = this.categories;

  async loadHome(): Promise<void> {
    if (this.homeResult()) return;
    const res = await deliver(this.browser, '', '', this.browser.homeFile());
    this.homeResult.set(res);
  }

  /** home: "Browse by persona" -> "content/", "View schema docs" -> "schema/". */
  chooseRoot(root: string): void {
    this.activeRoot.set(root);
    this.selectedCategory.set(null);
    this.selectedFile.set(null);
    this.result.set(null);
    this.current.set('categoryList');
  }

  chooseCategory(category: string): void {
    this.selectedCategory.set(category);
    this.selectedFile.set(null);
    this.result.set(null);
    this.current.set('fileList');
  }

  /**
   * view.state.category-switcher-dropdown: from fileList or content, jump
   * straight to another sibling category's fileList — not back to Home.
   */
  switchCategory(category: string): void {
    if (!category || category === this.selectedCategory()) return;
    this.chooseCategory(category);
  }

  async chooseFile(file: string): Promise<void> {
    this.selectedFile.set(file);
    this.current.set('content');
    this.loading.set(true);
    const res = await deliver(
      this.browser,
      this.activeRoot() ?? '',
      this.selectedCategory() ?? '',
      file
    );
    this.result.set(res);
    this.loading.set(false);
  }

  goHome(): void {
    this.current.set('home');
    this.activeRoot.set(null);
    this.selectedCategory.set(null);
    this.selectedFile.set(null);
    this.result.set(null);
  }

  backToCategories(): void {
    this.selectedCategory.set(null);
    this.selectedFile.set(null);
    this.result.set(null);
    this.current.set('categoryList');
  }

  backToFiles(): void {
    this.selectedFile.set(null);
    this.result.set(null);
    this.current.set('fileList');
  }
}
