import { ChangeDetectionStrategy, Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { STANDARD_REFERENCE, standardFileUrl } from '../core/content-source';
import { renderMarkdown } from '../core/markdown';

/**
 * content.source: the schema reference folder (the standard itself) is
 * persona-invariant — one canonical technical reference, shown identically to
 * every reader, not part of persona-switched topic content. This is that
 * separate "view the standard" area.
 */
@Component({
  selector: 'app-standard-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="reader-wrap">
      <p class="std-kicker">{{ label }} · the same for every persona</p>
      @if (error()) {
        <div class="pane-state">
          <h2>Standard reference unavailable</h2>
          <p>{{ error() }}</p>
        </div>
      } @else {
        <article class="markdown" [innerHTML]="html()"></article>
      }
    </div>
  `,
  styles: [
    `
      .std-kicker {
        font-family: var(--font-display);
        font-size: 0.6875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-muted);
      }
      .reader-wrap { max-width: 760px; margin: 0 auto; padding: 26px 32px 88px; }
    `
  ]
})
export class StandardPage implements OnInit {
  readonly label = STANDARD_REFERENCE.label;
  private sanitizer = inject(DomSanitizer);

  readonly html = signal<SafeHtml>('');
  readonly error = signal<string>('');

  async ngOnInit(): Promise<void> {
    try {
      const res = await fetch(standardFileUrl());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const md = await res.text();
      this.html.set(this.sanitizer.bypassSecurityTrustHtml(renderMarkdown(md)));
    } catch {
      this.error.set(`Could not load ${standardFileUrl()}.`);
    }
  }
}
