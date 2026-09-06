import { Component, computed, input } from '@angular/core';
import { STEP_BY_PATH } from './step-defs';
import { AppIcon } from './app-icon';

/**
 * layout.three-panel Panel 3 — one plain-language paragraph for the active
 * step. Generic: text comes from STEP_DEFS[path].guide (micro.reusable-template).
 */
@Component({
  selector: 'app-step-guide',
  standalone: true,
  imports: [AppIcon],
  template: `
    <aside class="guide">
      <div class="guide-head">
        <app-icon name="icon-read" [size]="14" />
        <span>{{ heading() }}</span>
      </div>
      <p class="guide-body">{{ text() }}</p>
    </aside>
  `,
  styles: [
    `
      .guide { height: 100%; display: flex; flex-direction: column; }
      .guide-head {
        display: flex;
        align-items: center;
        gap: 8px;
        height: 44px;
        flex-shrink: 0;
        padding: 0 16px;
        border-bottom: 1px solid var(--border-subtle);
        font-family: var(--font-display);
        font-size: 0.6875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-muted);
      }
      .guide-body {
        margin: 0;
        padding: 16px;
        font-size: 0.8125rem;
        line-height: 1.6;
        color: var(--text-body);
      }
    `
  ]
})
export class StepGuide {
  current = input.required<string>();

  private def = computed(() => STEP_BY_PATH[this.current()]);
  heading = computed(() => {
    const d = this.def();
    return d ? `${d.n}. ${d.label}` : 'Guide';
  });
  text = computed(() => this.def()?.guide ?? '');
}
