import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BRAND, BRAND_LINE, BRAND_TITLE } from './brand/brand';
import { FolderBrowser } from './core/folder-browser';
import { ViewState } from './state/view-state';
import { AppIcon } from './ui/app-icon';
import { HomeView } from './ui/home-view';
import { ListView } from './ui/list-view';
import { ContentView } from './ui/content-view';
import { CategorySwitcher } from './ui/category-switcher';

/**
 * The whole shell. There is no router — `state.current()` decides which view
 * renders (view.state). The rail + top bar are constant; everything below
 * switches on the single state variable.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppIcon, HomeView, ListView, ContentView, CategorySwitcher],
  template: `
    <div class="studio-shell">
      <nav class="rail">
        <button type="button" class="rail-btn" [title]="brand.productName" (click)="state.goHome()">
          <app-icon name="icon-catenator-logo" [size]="24" />
        </button>
      </nav>

      <div class="shell-main">
        <header class="shell-topbar">
          <span class="topbar-brand">{{ brandLine }}</span>
        </header>

        <div class="workspace">
          @if (!browser.ready() && browser.error()) {
            <div class="pane-state">
              <h2>Could not load the content index</h2>
              <p>{{ browser.error() }}</p>
            </div>
          } @else {
            @switch (state.current()) {
              @case ('home') {
                <app-home-view />
              }
              @case ('categoryList') {
                <app-list-view
                  [heading]="categoryHeading()"
                  [items]="state.categories()"
                  [selected]="state.selectedCategory()"
                  (pick)="state.chooseCategory($event)"
                  (home)="state.goHome()" />
              }
              @case ('fileList') {
                <div class="view-bar"><app-category-switcher /></div>
                <app-list-view
                  [heading]="state.selectedCategory() ?? ''"
                  [items]="state.files()"
                  [selected]="state.selectedFile()"
                  [parentLabel]="state.activeRoot()"
                  (pick)="state.chooseFile($event)"
                  (back)="state.backToCategories()"
                  (home)="state.goHome()" />
              }
              @case ('content') {
                <div class="view-bar"><app-category-switcher /></div>
                <app-content-view />
              }
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .rail {
        width: 48px;
        min-width: 48px;
        height: 100%;
        background: var(--rail-bg);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px 0;
        box-sizing: border-box;
      }
      .rail-btn {
        background: transparent;
        border: 0;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        color: #ffffff;
      }
      .workspace { flex: 1; min-height: 0; overflow-y: auto; background: var(--panel-bg); }
      .view-bar {
        display: flex;
        justify-content: flex-end;
        max-width: 780px;
        margin: 0 auto;
        padding: 14px 32px 0;
      }
    `
  ]
})
export class App implements OnInit {
  readonly brand = BRAND;
  readonly brandLine = BRAND_LINE;
  readonly state = inject(ViewState);
  readonly browser = inject(FolderBrowser);

  // Generic: the heading is just the chosen root's own name — no per-root label
  // table, nothing about personas or sections hardcoded.
  readonly categoryHeading = computed(() => (this.state.activeRoot() ?? '').replace(/\/$/, ''));

  constructor() {
    inject(Title).setTitle(BRAND_TITLE);
  }

  async ngOnInit(): Promise<void> {
    await this.browser.load();
    await this.state.loadHome();
  }
}
