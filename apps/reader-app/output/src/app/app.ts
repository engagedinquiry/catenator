import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BRAND, BRAND_TITLE } from './brand/brand';
import { AppIcon } from './ui/app-icon';

/**
 * The app shell is just the utility rail + the routed page. layout.reader-shell
 * (top bar with the persona dropdown, fixed-width topic list, content pane)
 * lives in PersonaPage — navigation.routes micro.layout-applies-below-home: the
 * home route uses its own simpler single-column rendering.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, AppIcon],
  template: `
    <div class="studio-shell">
      <nav class="rail">
        <a class="rail-btn logo-btn" routerLink="/" [title]="brand.productName">
          <app-icon name="icon-catenator-logo" [size]="24" />
        </a>
      </nav>
      <div class="shell-main">
        <router-outlet />
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
      .rail-btn { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; color: #ffffff; }
    `
  ]
})
export class App {
  readonly brand = BRAND;

  constructor() {
    inject(Title).setTitle(BRAND_TITLE);
  }
}
