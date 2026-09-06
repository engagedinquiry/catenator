import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionStore } from '../core/session-store';
import { STEP_DEFS } from './step-defs';
import { AppIcon } from './app-icon';

/**
 * layout.three-panel Panel 1 — vertical step navigation. Generic: renders
 * STEP_DEFS, nothing per-step is hard-coded here.
 *
 * micro.nav-display-only: each row is a real routerLink. Navigation still
 * passes through the canActivate guards in core/step-guards.ts, so clicking an
 * incomplete future step redirects back exactly as typing the URL would. This
 * panel does not gate.
 *
 * stateStyle: completed = filled background; active = outlined/highlighted;
 * upcoming = neutral. The plain step number stays the primary identifier of
 * every row.
 */
@Component({
  selector: 'app-step-nav',
  standalone: true,
  imports: [RouterLink, AppIcon],
  template: `
    <nav class="step-nav" aria-label="Steps">
      @for (s of rows(); track s.path) {
        <a
          class="step"
          [class.active]="s.active"
          [class.done]="s.done && !s.active"
          [class.upcoming]="!s.active && !s.done"
          [routerLink]="'/' + s.path"
          [attr.aria-current]="s.active ? 'step' : null">
          <span class="badge">{{ s.n }}</span>
          <app-icon class="step-icon" [name]="s.icon" [size]="15" />
          <span class="step-label">{{ s.label }}</span>
        </a>
      }
    </nav>
  `,
  styles: [
    `
      .step-nav {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 10px;
      }
      .step {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 7px 10px;
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
      .step .step-icon { color: var(--text-muted); opacity: 0.85; }

      /* completed — filled background */
      .step.done {
        background: var(--accent-blue-light);
        color: var(--text-title);
      }
      .step.done .step-icon { color: var(--badge-pass-bg); opacity: 1; }
      .step.done .badge {
        background: var(--badge-pass-bg);
        border-color: var(--badge-pass-bg);
        color: #ffffff;
      }

      /* active — outlined / highlighted, not filled */
      .step.active {
        background: var(--canvas-bg);
        border-color: var(--accent-blue);
        color: var(--accent-blue-strong);
        font-weight: 700;
      }
      .step.active .step-icon { color: var(--accent-blue); opacity: 1; }
      .step.active .badge {
        background: var(--accent-blue);
        border-color: var(--accent-blue);
        color: #ffffff;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--accent-blue-light);
        border: 1px solid #bfdbfe;
        color: var(--accent-blue);
        font-size: 0.625rem;
        font-weight: 700;
        flex-shrink: 0;
      }
    `
  ]
})
export class StepNav {
  private store = inject(SessionStore);

  current = input.required<string>();

  rows = computed(() =>
    STEP_DEFS.map((d) => ({
      n: d.n,
      path: d.path,
      label: d.label,
      icon: d.icon,
      done: d.done(this.store),
      active: this.current() === d.path
    }))
  );
}
