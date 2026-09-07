import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BRAND, BRAND_LINE, BRAND_TITLE } from './brand/brand';
import { AppIcon } from './ui/app-icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AppIcon],
  template: `
    <div class="studio-shell">
      <nav class="rail">
        <a class="rail-btn logo-btn" routerLink="/" [title]="brand.productName">
          <app-icon name="icon-catenator-logo" [size]="24" />
        </a>
      </nav>

      <div class="shell-main">
        <header class="shell-topbar">
          <span class="topbar-brand">{{ brandLine }}</span>
          <a class="topbar-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            Read
          </a>
          <a class="topbar-link" routerLink="/standard" routerLinkActive="active">The standard</a>
        </header>

        <div class="workspace">
          <router-outlet />
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
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        color: #ffffff;
      }
      .topbar-link + .topbar-link { margin-left: 8px; }
      .topbar-link.active { color: var(--text-title); border-color: #bfdbfe; background: var(--accent-blue-light); }
      .workspace { flex: 1; min-height: 0; display: flex; overflow: hidden; }
      .workspace > * { flex: 1; min-width: 0; }
    `
  ]
})
export class App {
  readonly brand = BRAND;
  readonly brandLine = BRAND_LINE;

  constructor() {
    inject(Title).setTitle(BRAND_TITLE);
  }
}
