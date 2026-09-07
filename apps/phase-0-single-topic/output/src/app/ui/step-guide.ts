import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { STEP_BY_PATH } from './step-defs';

/**
 * layout.three-panel Panel 3 — the plain-language guide for the active step.
 * Reads STEP_DEFS[path].guide — the same shared list Panel 1 uses
 * (micro.reusable-template). Updates as the active step changes.
 */
@Component({
  selector: 'app-step-guide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="guide">
      <h3>{{ label() }}</h3>
      <p>{{ text() }}</p>
    </aside>
  `,
  styles: [
    `
      .guide { padding: 22px 20px; }
      .guide h3 {
        margin: 0 0 8px;
        font-family: var(--font-display);
        font-size: 0.8125rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-muted);
      }
      .guide p { margin: 0; font-size: 0.8125rem; color: var(--text-body); line-height: 1.6; }
    `
  ]
})
export class StepGuide {
  readonly current = input.required<string>();
  readonly label = computed(() => STEP_BY_PATH[this.current()]?.label ?? '');
  readonly text = computed(() => STEP_BY_PATH[this.current()]?.guide ?? '');
}
