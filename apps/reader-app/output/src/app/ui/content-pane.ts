import { ChangeDetectionStrategy, Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BRAND } from '../brand/brand';
import { renderMarkdown } from '../core/markdown';
import { ReaderStore } from '../state/reader-store';

/**
 * The content pane — renders the delivered markdown, or the explicit state
 * message when there is none (no persona chosen / not covered / not found).
 *
 * mustNever "Fail silently if a topic's file is missing" — every non-content
 * DeliveryResponse renders a visible, worded message here, never a blank pane.
 */
@Component({
  selector: 'app-content-pane',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (store.loading()) {
      <p class="pane-note">Loading…</p>
    } @else {
      @switch (res()?.kind) {
        @case ('content') {
          <article class="markdown" [innerHTML]="html()"></article>
        }
        @case ('no-persona-selected') {
          <div class="pane-intro">
            <h1>{{ brand.productName }}</h1>
            <p class="lead">{{ brand.tagline }}</p>
            <p>
              This is the same governed material, shaped for six different audiences.
              Choose a persona on the left to read its version — the topic you're on
              stays put when you switch.
            </p>
            <p class="pane-note">{{ message() }}</p>
          </div>
        }
        @case ('not-available-for-persona') {
          <div class="pane-state">
            <h2>Not covered for this persona</h2>
            <p>{{ message() }}</p>
            <p class="pane-note">Pick another topic, or switch personas to one that covers it.</p>
          </div>
        }
        @case ('not-found') {
          <div class="pane-state">
            <h2>Content unavailable</h2>
            <p>{{ message() }}</p>
          </div>
        }
        @default {
          <p class="pane-note">Choose a persona to begin.</p>
        }
      }
    }
  `,
  styles: [
    `
      app-content-pane { display: block; }
      .pane-note { color: var(--text-muted); font-size: 0.8125rem; }
      .pane-intro, .pane-state { max-width: 640px; }
      .pane-state h2 { margin-top: 0; }
    `
  ]
})
export class ContentPane {
  readonly store = inject(ReaderStore);
  readonly brand = BRAND;
  private sanitizer = inject(DomSanitizer);

  readonly res = this.store.response;

  readonly message = computed(() => {
    const r = this.res();
    return r && r.kind !== 'content' ? r.message : '';
  });

  readonly html = computed(() => {
    const r = this.res();
    if (r?.kind !== 'content') return '';
    return this.sanitizer.bypassSecurityTrustHtml(renderMarkdown(r.markdown));
  });
}
