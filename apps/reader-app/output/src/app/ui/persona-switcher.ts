import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReaderStore } from '../state/reader-store';

/**
 * The persona switcher — six options, exactly one selected at a time, always
 * visible as its own control (delivery.request-response micro.both-explicit).
 *
 * style.visual-theme micro.apply-to-reader-ui-elements: selected option gets a
 * filled background (the same "done" treatment Phase 0's step-nav uses),
 * unselected options are neutral/outlined.
 */
@Component({
  selector: 'app-persona-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="switcher" role="group" aria-label="Choose a persona">
      <p class="switcher-label">Reading as</p>
      @for (p of store.personas; track p.id) {
        <button
          type="button"
          class="option"
          [class.selected]="store.personaId() === p.id"
          [attr.aria-pressed]="store.personaId() === p.id"
          (click)="store.selectPersona(p.id)">
          {{ p.label }}
        </button>
      }
      @if (!store.hasPersona()) {
        <p class="switcher-hint">Pick one to see that audience's version. You can switch anytime.</p>
      }
    </div>
  `,
  styles: [
    `
      .switcher { display: flex; flex-direction: column; gap: 4px; padding: 12px; }
      .switcher-label {
        margin: 0 0 4px;
        font-family: var(--font-display);
        font-size: 0.6875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-muted);
      }
      .option {
        text-align: left;
        background: var(--canvas-bg);
        color: var(--text-body);
        border: 1px solid var(--border-control);
        border-radius: var(--radius-control);
        padding: 8px 12px;
        font-family: var(--font-display);
        font-size: 0.8125rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .option:hover { background: #f1f5f9; color: var(--text-title); }
      .option.selected {
        background: var(--accent-blue);
        border-color: var(--accent-blue);
        color: #ffffff;
        font-weight: 700;
      }
      .switcher-hint { margin: 8px 2px 0; font-size: 0.75rem; color: var(--text-muted); }
    `
  ]
})
export class PersonaSwitcher {
  readonly store = inject(ReaderStore);
}
