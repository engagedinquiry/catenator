import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ViewState } from '../state/view-state';

/**
 * view.state.category-switcher-dropdown — shown in fileList and content. A
 * <select> of every sibling category under the current root; choosing one jumps
 * straight to that category's fileList (never back to Home). Labels are the
 * on-disk folder names, verbatim.
 */
@Component({
  selector: 'app-category-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="cs">
      <span class="cs-label">{{ (state.activeRoot() ?? '').replace('/', '') }}</span>
      <select (change)="pick($event)">
        @for (c of state.siblingCategories(); track c) {
          <option [value]="c" [selected]="c === state.selectedCategory()">{{ c }}</option>
        }
      </select>
    </label>
  `,
  styles: [
    `
      .cs { display: inline-flex; align-items: center; gap: 8px; }
      .cs-label {
        font-family: var(--font-display);
        font-size: 0.625rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: var(--text-muted);
      }
      select {
        font: inherit;
        font-family: var(--font-mono);
        font-size: 0.8125rem;
        color: var(--text-title);
        background: var(--canvas-bg);
        border: 1px solid var(--border-control);
        border-radius: var(--radius-control);
        padding: 5px 8px;
      }
      select:focus { outline: none; border-color: var(--accent-blue); box-shadow: 0 0 0 3px var(--accent-blue-light); }
    `
  ]
})
export class CategorySwitcher {
  readonly state = inject(ViewState);

  pick(ev: Event): void {
    this.state.switchCategory((ev.target as HTMLSelectElement).value);
  }
}
