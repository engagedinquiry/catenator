import { Component, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { BRAND_LINE, BRAND_TITLE } from './brand/brand';
import { SessionStore } from './core/session-store';
import { AppRail } from './ui/app-rail';
import { KeyBanner } from './ui/key-banner';
import { STEP_BY_PATH } from './ui/step-defs';
import { StepGuide } from './ui/step-guide';
import { StepNav } from './ui/step-nav';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, AppRail, StepNav, StepGuide, KeyBanner],
  template: `
    <div class="studio-shell">
      <app-rail />

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
  `
})
export class App {
  readonly store = inject(SessionStore);
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

  private pathOf(url: string): string {
    return url.split('?')[0].split('#')[0].replace(/^\/+/, '').split('/')[0] || 'intro';
  }
}
