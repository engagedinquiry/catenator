import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { BRAND } from './brand/brand';
import { ContentBrowser } from './core/content-browser';
import { ViewState } from './state/view-state';
import { NavPanel } from './ui/nav-panel';
import { ContentPane } from './ui/content-pane';

/**
 * layout.shell — a fixed-position left panel (full viewport height, fixed width,
 * always visible above the mobile breakpoint) and a content pane that scrolls
 * independently. Below 768px (the single breakpoint shared with
 * ui.edge-cases.mobile-collapsible-nav) the panel collapses behind a toggle.
 *
 * The root component owns URL -> state: on every NavigationEnd it hands the URL
 * to ViewState.applyRoute(), so a bookmarked/direct load produces the same state
 * as clicking through (navigation.routing.direct-load-works).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavPanel, ContentPane],
  template: `
    <div class="shell" [class.nav-open]="navOpen()">
      <button
        type="button"
        class="nav-toggle"
        aria-label="Toggle navigation"
        [attr.aria-expanded]="navOpen()"
        (click)="navOpen.set(!navOpen())">
        ☰
      </button>

      <aside class="left-panel">
        @if (browser.ready()) {
          <app-nav-panel />
        } @else if (browser.error()) {
          <p class="panel-error">Could not load the content index ({{ browser.error() }}).</p>
        } @else {
          <p class="panel-error">Loading…</p>
        }
      </aside>

      <main class="content-pane" (click)="closeNavOnMobile()">
        <app-content-pane />
      </main>
    </div>
  `,
  styles: [
    `
      .shell { height: 100vh; overflow: hidden; }

      .left-panel {
        position: fixed;
        top: 0;
        left: 0;
        width: 264px;
        height: 100vh;
        background: var(--panel-bg);
        border-right: 1px solid var(--border-subtle);
        z-index: 20;
      }
      .panel-error { padding: 16px; font-size: 0.8125rem; color: var(--text-muted); }

      /* content-pane: to the right of the fixed panel, scrolls on its own */
      .content-pane {
        margin-left: 264px;
        height: 100vh;
        overflow-y: auto;
        background: var(--panel-bg);
      }

      .nav-toggle {
        display: none;
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 30;
        width: 36px;
        height: 36px;
        border: 1px solid var(--border-control);
        border-radius: var(--radius-control);
        background: var(--canvas-bg);
        font-size: 1rem;
        cursor: pointer;
      }

      @media (max-width: 768px) {
        .left-panel {
          transform: translateX(-100%);
          transition: transform 0.2s ease;
          box-shadow: 0 0 24px rgba(15, 23, 42, 0.15);
        }
        .shell.nav-open .left-panel { transform: translateX(0); }
        .content-pane { margin-left: 0; padding-top: 44px; }
        .nav-toggle { display: block; }
      }
    `
  ]
})
export class App {
  readonly brand = BRAND;
  readonly browser = inject(ContentBrowser);
  readonly state = inject(ViewState);
  private router = inject(Router);

  readonly navOpen = signal(false);

  constructor() {
    this.boot();
  }

  private async boot(): Promise<void> {
    await this.browser.load();
    await this.state.applyRoute(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.navOpen.set(false);
        void this.state.applyRoute(e.urlAfterRedirects);
      });
  }

  closeNavOnMobile(): void {
    if (this.navOpen()) this.navOpen.set(false);
  }
}
