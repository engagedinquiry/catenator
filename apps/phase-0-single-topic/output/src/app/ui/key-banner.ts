import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionStore } from '../core/session-store';

/**
 * interrupt.conditional-api-key — the shell banner form of the interrupt.
 *
 * mustNever:
 *  - "Show this interrupt when a key is already set" -> hidden when hasApiKey().
 *  - "Block navigation through Steps 0-3" -> this is a dismissible banner, never
 *     a modal or a route block. The only hard block is inside RefractStep.
 *  - "Add this as a permanent numbered step" -> it has no step number and no
 *     STEP_DEFS entry; Settings is a plain page, not a step.
 */
@Component({
  selector: 'app-key-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (show()) {
      <div class="key-banner" role="status">
        <span>
          No API key set.
          @if (current() === 'refract') {
            Step 4 (Refract) needs one.
          } @else {
            You can keep going — Step 4 (Refract) will need one.
          }
        </span>
        <a routerLink="/settings" class="link">Add API key →</a>
      </div>
    }
  `,
  styles: [
    `
      .key-banner {
        display: flex;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
        background: #fffbeb;
        border: 1px solid #fde68a;
        border-radius: var(--radius-card);
        padding: 10px 14px;
        margin-bottom: 16px;
        font-size: 0.8125rem;
        color: #92400e;
      }
      .key-banner .link { margin-left: auto; font-weight: 700; color: var(--accent-blue); text-decoration: none; }
    `
  ]
})
export class KeyBanner {
  private store = inject(SessionStore);
  readonly current = input.required<string>();
  readonly show = computed(() => !this.store.hasApiKey());
}
