import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { BRAND, BRAND_LINE, BRAND_TITLE } from './brand/brand';
import { SessionStore } from './core/session-store';
import { AppIcon } from './ui/app-icon';
import { KeyBanner } from './ui/key-banner';
import { NarrowViewportNotice } from './ui/narrow-viewport-notice';
import { STEP_BY_PATH } from './ui/step-defs';
import { StepGuide } from './ui/step-guide';
import { StepNav } from './ui/step-nav';

/**
 * The shell: a utility rail + layout.three-panel (step-nav / active step /
 * step-guide). branding.rename: every name shown here reads from BRAND.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, AppIcon, StepNav, StepGuide, KeyBanner, NarrowViewportNotice],
  template: `
    <div class="studio-shell">
      <nav class="rail">
        <a class="rail-btn" routerLink="/intro" [title]="brand.productName">
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

        <div class="workspace">
          @if (isStep()) {
            <div class="panel panel-nav"><app-step-nav [current]="currentPath()" /></div>
          }
          <main class="panel panel-center">
            <div class="wrap">
              <app-narrow-viewport-notice />
              @if (isStep()) {
                <app-key-banner [current]="currentPath()" />
              }
              <router-outlet />
            </div>
          </main>
          @if (isStep()) {
            <div class="panel panel-guide"><app-step-guide [current]="currentPath()" /></div>
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
      .studio-shell { display: flex; height: 100vh; width: 100%; overflow: hidden; background: var(--panel-bg); }
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
      .workspace { flex: 1; min-height: 0; display: flex; overflow: hidden; }
      .panel { height: 100%; box-sizing: border-box; }
      .panel-nav {
        width: 232px;
        min-width: 232px;
        background: var(--panel-bg);
        border-right: 1px solid var(--border-subtle);
        overflow-y: auto;
      }
      .panel-center { flex: 1; min-width: 0; overflow-y: auto; background: var(--panel-bg); }
      .panel-guide {
        width: 300px;
        min-width: 300px;
        background: var(--canvas-bg);
        border-left: 1px solid var(--border-subtle);
        overflow-y: auto;
      }
      @media (max-width: 1080px) { .panel-guide { display: none; } }
      .wrap { max-width: 720px; margin: 0 auto; padding: 26px 28px 88px; }
    `
  ]
})
export class App {
  readonly store = inject(SessionStore);
  readonly brand = BRAND;
  readonly brandLine = BRAND_LINE;
  private router = inject(Router);

  readonly currentPath = signal<string>(this.pathOf(this.router.url));
  readonly isStep = computed(() => this.currentPath() in STEP_BY_PATH);

  constructor() {
    inject(Title).setTitle(BRAND_TITLE);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.currentPath.set(this.pathOf(e.urlAfterRedirects)));
  }

  restart(): void {
    this.store.reset();
    this.router.navigate(['/topic']);
  }

  private pathOf(url: string): string {
    return url.split('?')[0].split('#')[0].replace(/^\/+/, '').split('/')[0] || 'intro';
  }
}
