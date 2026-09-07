import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { displayName } from '../core/content-browser';
import { ViewState } from '../state/view-state';
import { AppIcon } from './app-icon';
import { PersonaTopics } from './persona-topics';
import { SchemaTree } from './schema-tree';
import { BRAND } from '../brand/brand';

/**
 * layout.shell left-panel content + view.state.
 *
 * Always visible together: Home button, the "Reading as" <select>, the
 * "Schema docs" button. Below them, exactly one of the persona topic list or
 * the schema tree, chosen by `mode` alone (mutual-exclusivity). Selecting a
 * persona clears the Schema-docs active state; clicking Schema docs resets the
 * dropdown — both directions (bidirectional-reset).
 */
@Component({
  selector: 'app-nav-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppIcon, PersonaTopics, SchemaTree],
  template: `
    <div class="nav-inner">
      <button type="button" class="home" (click)="state.goHome()">
        <app-icon name="icon-catenator-logo" [size]="18" />
        <span>{{ brand.productName }}</span>
      </button>

      <label class="reading-as">
        <span class="ra-label">Reading as</span>
        <select (change)="onPersona($event)" aria-label="Reading as">
          <option value="" disabled [selected]="!state.selectedPersona()">Choose a persona…</option>
          @for (p of state.personaOptions(); track p.name) {
            <option [value]="p.name" [selected]="p.name === state.selectedPersona()">{{ label(p.name) }}</option>
          }
        </select>
      </label>

      <!-- layout.shell.fixed-vertical-order: DOM order is always Home, dropdown,
           [persona topic list — mode 'persona' only, BETWEEN dropdown and the
           Schema docs button], Schema docs button, [schema tree — mode 'schema'
           only, directly below the button]. Positions never move; (3) and (5)
           are mutually exclusive per view.state. -->
      @if (state.mode() === 'persona') {
        <div class="lower persona-lower"><app-persona-topics /></div>
      }

      <button
        type="button"
        class="schema-btn"
        [class.active]="state.mode() === 'schema'"
        [attr.aria-pressed]="state.mode() === 'schema'"
        (click)="state.openSchema()">
        Schema docs
      </button>

      @if (state.mode() === 'schema') {
        <div class="lower schema-lower"><app-schema-tree [prefix]="[]" /></div>
      }
    </div>
  `,
  styles: [
    `
      .nav-inner { display: flex; flex-direction: column; gap: 10px; padding: 14px; height: 100%; overflow-y: auto; }
      .home {
        display: flex;
        align-items: center;
        gap: 8px;
        background: transparent;
        border: 0;
        padding: 4px 2px;
        cursor: pointer;
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 0.8125rem;
        color: var(--text-title);
      }
      .home:hover { color: var(--accent-blue); }
      .reading-as { display: flex; flex-direction: column; gap: 4px; }
      .ra-label {
        font-family: var(--font-display);
        font-size: 0.5625rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: var(--text-muted);
      }
      select {
        font: inherit;
        font-family: var(--font-mono);
        font-size: 0.78rem;
        color: var(--text-title);
        background: var(--canvas-bg);
        border: 1px solid var(--border-control);
        border-radius: var(--radius-control);
        padding: 6px 8px;
      }
      select:focus { outline: none; border-color: var(--accent-blue); box-shadow: 0 0 0 3px var(--accent-blue-light); }
      .schema-btn {
        text-align: left;
        background: var(--canvas-bg);
        border: 1px solid var(--border-control);
        border-radius: var(--radius-control);
        padding: 7px 10px;
        font-family: var(--font-display);
        font-weight: 600;
        font-size: 0.8125rem;
        color: var(--text-body);
        cursor: pointer;
      }
      .schema-btn:hover { background: #f1f5f9; color: var(--text-title); }
      .schema-btn.active { background: var(--accent-blue); border-color: var(--accent-blue); color: #fff; font-weight: 700; }
      .lower { margin: 0; }
      .persona-lower { margin-top: -2px; }
    `
  ]
})
export class NavPanel {
  readonly state = inject(ViewState);
  readonly brand = BRAND;

  onPersona(ev: Event): void {
    this.state.selectPersona((ev.target as HTMLSelectElement).value);
  }
  label(name: string): string {
    return displayName(name);
  }
}
