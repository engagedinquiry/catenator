import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BRAND } from '../brand/brand';
import { ViewState } from '../state/view-state';

/**
 * view.state 'home' — two options. "Browse by persona" sets activeRoot to
 * "content/"; "View schema docs" sets it to "schema/". Both move to categoryList.
 * The two roots are the only place either string appears in the UI layer.
 */
@Component({
  selector: 'app-home-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="home">
      <h1>{{ brand.productName }}</h1>
      <p class="lead">{{ brand.tagline }}</p>
      <div class="options">
        <button type="button" class="option" (click)="state.chooseRoot('content/')">
          <span class="option-title">Browse by persona</span>
          <span class="option-sub">The same governed material, shaped for each audience</span>
        </button>
        <button type="button" class="option" (click)="state.chooseRoot('schema/')">
          <span class="option-title">View schema docs</span>
          <span class="option-sub">The Catenator standard itself, section by section</span>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .home { max-width: 640px; margin: 0 auto; padding: 64px 32px; }
      .home h1 { margin: 0 0 4px; }
      .options { display: flex; flex-direction: column; gap: 12px; margin-top: 28px; }
      .option {
        display: flex;
        flex-direction: column;
        gap: 4px;
        text-align: left;
        padding: 16px 18px;
        background: var(--canvas-bg);
        border: 1px solid var(--border-control);
        border-radius: var(--radius-card);
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .option:hover { border-color: var(--accent-blue); background: var(--accent-blue-light); }
      .option-title { font-family: var(--font-display); font-weight: 700; font-size: 0.9375rem; color: var(--text-title); }
      .option-sub { font-size: 0.8125rem; color: var(--text-muted); }
    `
  ]
})
export class HomeView {
  readonly brand = BRAND;
  readonly state = inject(ViewState);
}
