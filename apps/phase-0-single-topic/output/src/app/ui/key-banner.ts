import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionStore } from '../core/session-store';

/**
 * interrupt.conditional-api-key — a conditional API-key notice, NOT a numbered
 * step.
 *
 * mustNever:
 *  - "Show this interrupt when a key is already set"   -> visible() checks !hasApiKey()
 *  - "Block navigation through Steps 0-3"              -> inline notice, dismissible, no gate
 *  - "Add this as a permanent numbered step"           -> lives in the shell, not the routes
 *
 * micro.hard-block-at-refract-only: the Refract step has its own hard gate, so
 * this banner hides there (nothing to add that the step doesn't already say).
 */
@Component({
  selector: 'app-key-banner',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (visible()) {
      <div class="key-banner" role="status">
        <span>
          You’ll need an API key before refraction can run.
          <a routerLink="/settings">Add one now</a>, or continue and add it later before Step 4.
        </span>
        <button type="button" class="x" (click)="dismissed.set(true)" aria-label="Dismiss">✕</button>
      </div>
    }
  `,
  styles: [
    `
      .key-banner {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 18px;
        padding: 10px 12px;
        background: #fffbeb;
        border: 1px solid #fde68a;
        border-radius: var(--radius-card);
        font-size: 0.8125rem;
        color: #92400e;
      }
      .key-banner a { color: #92400e; font-weight: 700; }
      .key-banner .x {
        margin-left: auto;
        flex-shrink: 0;
        background: transparent;
        border: 0;
        color: #92400e;
        font-size: 0.75rem;
        padding: 2px 4px;
      }
      .key-banner .x:hover { background: rgba(146, 64, 14, 0.1); }
    `
  ]
})
export class KeyBanner {
  private store = inject(SessionStore);

  current = input.required<string>();

  readonly dismissed = signal(false);

  visible = computed(
    () =>
      !this.dismissed() &&
      !this.store.hasApiKey() &&
      this.current() !== 'refract' &&
      this.current() !== 'settings'
  );
}
