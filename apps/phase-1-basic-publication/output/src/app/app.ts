import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { BRAND, BRAND_LINE, BRAND_TITLE } from './brand/brand';
import { PublicationStore } from './core/publication-store';
import { AppIcon } from './ui/app-icon';
import { NarrowViewportNotice } from './ui/narrow-viewport-notice';

/**
 * The shell: the left icon rail (logo + restart + settings) — "unchanged from
 * phase-0-single-topic and the reference workspace" — plus the topbar and the
 * routed body. The three-panel layout itself lives in ui/workspace.ts.
 *
 * branding.rename: every displayed name reads from BRAND.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, AppIcon, NarrowViewportNotice],
  template: `
    <div class="studio-shell">
      <nav class="rail">
        <a class="rail-btn" routerLink="/" [title]="brand.productName">
          <app-icon name="icon-catenator-logo" [size]="24" />
        </a>
        <button type="button" class="rail-btn" title="Start over" (click)="restart()">↻</button>
        <a class="rail-btn" routerLink="/settings" title="Settings">⚙</a>
      </nav>

      <div class="shell-main">
        <header class="shell-topbar">
          <span class="topbar-brand">{{ brandLine }}</span>
          <a class="topbar-link" routerLink="/settings" [class.warn]="!store.hasApiKey()">
            {{ store.hasApiKey() ? 'API key set' : 'Add API key' }}
          </a>
        </header>
        <app-narrow-viewport-notice />
        <router-outlet />
      </div>
    </div>
  `,
  styles: [
    `
      .studio-shell { display: flex; height: 100vh; width: 100%; overflow: hidden; background: var(--panel-bg); }
      .rail {
        width: 48px;
        min-width: 48px;
        background: var(--rail-bg);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
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
        color: rgba(255, 255, 255, 0.75);
        font-size: 1rem;
        text-decoration: none;
      }
      .rail-btn:hover { color: #fff; }
      .shell-main { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
      .shell-topbar {
        display: flex;
        align-items: center;
        gap: 16px;
        height: 44px;
        flex-shrink: 0;
        padding: 0 16px;
        background: var(--canvas-bg);
        border-bottom: 1px solid var(--border-subtle);
      }
      .topbar-brand {
        font-size: 0.625rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-muted);
        font-family: var(--font-display);
      }
      .topbar-link {
        margin-left: auto;
        font-size: 0.75rem;
        font-weight: 600;
        text-decoration: none;
        color: var(--text-muted);
        padding: 4px 10px;
        border-radius: var(--radius-control);
        border: 1px solid var(--border-subtle);
      }
      .topbar-link.warn { color: var(--accent-blue); border-color: #bfdbfe; }
    `
  ]
})
export class App {
  readonly store = inject(PublicationStore);
  readonly brand = BRAND;
  readonly brandLine = BRAND_LINE;
  private router = inject(Router);

  constructor() {
    inject(Title).setTitle(BRAND_TITLE);
  }

  restart(): void {
    this.store.reset();
    this.router.navigate(['/']);
  }
}
