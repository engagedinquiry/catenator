import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionStore } from '../core/session-store';
import { STEP_DEFS } from './step-defs';

/**
 * layout.three-panel Panel 1 — vertical step navigation. Generic: renders
 * STEP_DEFS, nothing per-step hard-coded here (micro.reusable-template).
 *
 * micro.nav-display-only: each row is a real routerLink; navigation still passes
 * through the canActivate guards, so clicking an incomplete future step
 * redirects back exactly as typing the URL would — this panel does not gate.
 *
 * style.visual-theme: completed = FILLED background (completed-step-fill);
 * active = outlined/highlighted; upcoming = neutral. The plain number 0-5 stays
 * the primary identifier (no-icons-on-step-numbers).
 */
@Component({
  selector: 'app-step-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <nav class="step-nav" aria-label="Steps">
      @for (row of rows(); track row.path) {
        <a
          class="step"
          [class.active]="row.active"
          [class.done]="row.done && !row.active"
          [class.upcoming]="!row.active && !row.done"
          [routerLink]="'/' + row.path"
          [attr.aria-current]="row.active ? 'step' : null">
          <span class="badge">{{ row.n }}</span>
          <span class="step-label">{{ row.label }}</span>
        </a>
      }
    </nav>
  `,
  styles: [
    `
      .step-nav { display: flex; flex-direction: column; gap: 2px; padding: 12px; }
      .step {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border: 1px solid transparent;
        border-radius: var(--radius-control);
        font-family: var(--font-display);
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--text-muted);
        text-decoration: none;
        transition: all 0.15s ease;
      }
      .step:hover { background: #f1f5f9; color: var(--text-title); }
      .step .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--accent-blue-light);
        border: 1px solid #bfdbfe;
        color: var(--accent-blue);
        font-size: 0.6875rem;
        font-weight: 700;
        flex-shrink: 0;
      }
      /* completed — filled background (style.visual-theme.completed-step-fill) */
      .step.done { background: var(--accent-blue-light); color: var(--text-title); }
      .step.done .badge { background: var(--badge-pass-bg); border-color: var(--badge-pass-bg); color: #fff; }
      /* active — outlined / highlighted, not filled */
      .step.active {
        background: var(--canvas-bg);
        border-color: var(--accent-blue);
        color: var(--accent-blue-strong);
        font-weight: 700;
      }
      .step.active .badge { background: var(--accent-blue); border-color: var(--accent-blue); color: #fff; }
    `
  ]
})
export class StepNav {
  private store = inject(SessionStore);
  readonly current = input.required<string>();

  readonly rows = computed(() =>
    STEP_DEFS.map((d) => ({
      n: d.n,
      path: d.path,
      label: d.label,
      done: d.done(this.store),
      active: this.current() === d.path
    }))
  );
}
