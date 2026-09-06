import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BRAND } from '../brand/brand';
import { SessionStore } from '../core/session-store';
import { AppIcon } from './app-icon';

/**
 * 48px global utility rail. Visual only — no gating, state, or pipeline logic.
 */
@Component({
  selector: 'app-rail',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AppIcon],
  template: `
    <nav class="rail">
      <div class="rail-top">
        <a class="rail-btn logo-btn" routerLink="/topic" [title]="brand.productName">
          <app-icon name="icon-catenator-logo" [size]="24" />
        </a>
      </div>
      <div class="rail-bottom">
        <button type="button" class="rail-btn" title="Start over" (click)="restart()">
          <app-icon name="icon-update" [size]="20" />
        </button>
        <a class="rail-btn" routerLink="/settings" routerLinkActive="active" title="Settings">
          <app-icon name="icon-connection" [size]="20" />
        </a>
      </div>
    </nav>
  `,
  styles: [
    `
      :host { display: block; height: 100%; }
      .rail {
        width: 48px;
        min-width: 48px;
        height: 100%;
        background: var(--rail-bg);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;
        box-sizing: border-box;
      }
      .rail-top,
      .rail-bottom {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        width: 100%;
      }
      .rail-btn {
        background: transparent;
        border: none;
        padding: 0;
        margin: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        color: rgba(255, 255, 255, 0.7);
        transition: color 0.15s ease;
      }
      .rail-btn:hover { color: #ffffff; }
      .rail-btn.active { color: #ffffff; }
      .rail-btn.logo-btn { color: #ffffff; margin-bottom: 6px; }
    `
  ]
})
export class AppRail {
  readonly brand = BRAND;
  private store = inject(SessionStore);
  private router = inject(Router);

  restart(): void {
    this.store.reset();
    this.router.navigate(['/topic']);
  }
}
