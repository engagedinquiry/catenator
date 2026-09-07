import { ChangeDetectionStrategy, Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BRAND } from '../brand/brand';
import { renderFile } from '../core/markdown';
import { ViewState } from '../state/view-state';

/**
 * view.state 'home' — the rendered content of docs/README.md (fetched via the
 * same folder-browser mechanism, the one-file case), followed by the two
 * options. "Browse by persona" sets activeRoot to "content/"; "View schema
 * docs" sets it to "schema/". Both move to categoryList.
 */
@Component({
  selector: 'app-home-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="home">
      @if (readmeHtml()) {
        <article class="markdown home-readme" [innerHTML]="readmeHtml()"></article>
      }

      <div class="options">
        <button type="button" class="option" (click)="state.chooseRoot('content/')">
          <span class="option-title">Browse by persona</span>
          <span class="option-sub">The same governed material, shaped for each audience</span>
        </button>
        <button type="button" class="option" (click)="state.chooseRoot('schema/')">
          <span class="option-title">View schema docs</span>
          <span class="option-sub">The Catenator standard itself, section by section</span>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .home { max-width: 760px; margin: 0 auto; padding: 40px 32px 96px; }
      .home-readme { margin-bottom: 32px; }
      .options { display: flex; flex-direction: column; gap: 12px; }
      .option {
        display: flex;
        flex-direction: column;
        gap: 4px;
        text-align: left;
        padding: 16px 18px;
        background: var(--canvas-bg);
        border: 1px solid var(--border-control);
        border-radius: var(--radius-card);
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .option:hover { border-color: var(--accent-blue); background: var(--accent-blue-light); }
      .option-title { font-family: var(--font-display); font-weight: 700; font-size: 0.9375rem; color: var(--text-title); }
      .option-sub { font-size: 0.8125rem; color: var(--text-muted); }
    `
  ]
})
export class HomeView {
  readonly brand = BRAND;
  readonly state = inject(ViewState);
  private sanitizer = inject(DomSanitizer);

  readonly readmeHtml = computed(() => {
    const r = this.state.homeResult();
    if (!r?.ok) return '';
    return this.sanitizer.bypassSecurityTrustHtml(renderFile(r.file, r.text));
  });
}
