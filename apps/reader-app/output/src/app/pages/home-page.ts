import { ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { internalRouteForHref } from '../core/content-source';
import { resolveContentPath } from '../core/build-config';
import { renderMarkdown } from '../core/markdown';
import { BRAND } from '../brand/brand';

/**
 * navigation.routes "/" — renders the root index file (docs/README.md itself,
 * relative to contentSource.rootDir), not a persona/topic view. Single column
 * (micro.layout-applies-below-home).
 *
 * mustNever:
 *  - "Land the reader directly in a persona/topic view on first load" — this IS
 *     the entry route; it shows no persona content.
 *  - "Render docs/README.md's persona links as dead links" — every link whose
 *     href points into a known persona folder (or is a "#personaId" anchor) is
 *     intercepted and routed internally via internalRouteForHref().
 *  - "Duplicate docs/README.md's content by hand" — the actual file is fetched
 *     and rendered through the same renderMarkdown() used for every topic.
 */
@Component({
  selector: 'app-home-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="home-wrap">
      @if (error()) {
        <div class="pane-state">
          <h2>{{ brand.productName }}</h2>
          <p>Could not load the home page ({{ error() }}).</p>
        </div>
      } @else {
        <article #md class="markdown home-md" [innerHTML]="html()" (click)="onClick($event)"></article>
      }
    </div>
  `,
  styles: [
    `
      .home-wrap { max-width: 760px; margin: 0 auto; padding: 32px 32px 96px; }
      .home-md h2 { border-top: 1px solid var(--border-subtle); padding-top: 20px; }
      .home-md h2:first-of-type { border-top: 0; padding-top: 0; }
    `
  ]
})
export class HomePage implements OnInit {
  @ViewChild('md') mdEl?: ElementRef<HTMLElement>;
  readonly brand = BRAND;

  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);

  readonly html = signal<SafeHtml>('');
  readonly error = signal<string>('');

  async ngOnInit(): Promise<void> {
    try {
      const res = await fetch(resolveContentPath('README.md'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.html.set(this.sanitizer.bypassSecurityTrustHtml(renderMarkdown(await res.text())));
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'unknown');
    }
  }

  /** Intercept clicks on persona links (micro.home-link-interception). */
  onClick(ev: MouseEvent): void {
    const anchor = (ev.target as HTMLElement).closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href') ?? '';
    const route = internalRouteForHref(href);
    if (route) {
      ev.preventDefault();
      void this.router.navigate(['/', ...route]);
    }
  }
}
