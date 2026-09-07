import { ChangeDetectionStrategy, Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { renderFile } from '../core/markdown';
import { ViewState } from '../state/view-state';

/**
 * view.state 'content' — the selected file's rendered content, plus explicit
 * back controls (no browser back). Markdown files render as HTML; anything else
 * (.yaml in schema/9-examples, say) is shown verbatim.
 */
@Component({
  selector: 'app-content-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="content-view">
      <div class="crumbs">
        <button type="button" class="crumb" (click)="state.goHome()">Home</button>
        <span class="sep">/</span>
        <button type="button" class="crumb" (click)="state.backToCategories()">{{ state.activeRoot() }}</button>
        <span class="sep">/</span>
        <button type="button" class="crumb" (click)="state.backToFiles()">{{ state.selectedCategory() }}</button>
        <span class="sep">/</span>
        <span class="crumb current">{{ state.selectedFile() }}</span>
      </div>

      @if (state.loading()) {
        <p class="note">Loading…</p>
      } @else if (result()?.ok) {
        <article class="markdown" [innerHTML]="html()"></article>
      } @else {
        <div class="pane-state">
          <h2>Content unavailable</h2>
          <p>{{ message() }}</p>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .content-view { max-width: 780px; margin: 0 auto; padding: 24px 32px 88px; }
      .crumbs { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 18px; font-size: 0.75rem; }
      .content-view .crumb {
        background: transparent;
        border: 0;
        padding: 0;
        color: var(--accent-blue);
        cursor: pointer;
        font: inherit;
        text-decoration: underline;
      }
      .content-view .crumb.current { color: var(--text-muted); text-decoration: none; font-family: var(--font-mono); }
      .content-view .sep { color: var(--text-muted); }
      .note { color: var(--text-muted); font-size: 0.8125rem; }
    `
  ]
})
export class ContentView {
  readonly state = inject(ViewState);
  private sanitizer = inject(DomSanitizer);

  readonly result = this.state.result;

  readonly message = computed(() => {
    const r = this.result();
    return r && !r.ok ? r.message : '';
  });

  readonly html = computed(() => {
    const r = this.result();
    if (!r?.ok) return '';
    return this.sanitizer.bypassSecurityTrustHtml(renderFile(r.file, r.text));
  });
}
