import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  NgZone,
  OnDestroy,
  computed,
  inject,
  signal
} from '@angular/core';

/**
 * layout.three-panel:
 *   micro.narrow-viewport-notification — below 768px viewport width, show a
 *   dismissible banner saying this lab is not optimized for small screens and is
 *   best on a larger display. Notice ONLY: it does not collapse, restructure, or
 *   hide any part of the three-panel layout. Nothing about the layout changes at
 *   this breakpoint.
 *   micro.dismiss-persists-for-session — once dismissed it does not reappear for
 *   the rest of the session (in-memory only, matching state.topic-refraction's
 *   scope); it may reappear on a fresh session.
 */

const BREAKPOINT_PX = 768;

/**
 * Session-scoped dismissal. `providedIn: 'root'` = one instance for the life of
 * the loaded page (one session). Not cleared by SessionStore.reset() — a restart
 * is still the same session. A real page reload makes a new instance, so the
 * notice can return on a fresh session.
 */
@Injectable({ providedIn: 'root' })
export class NarrowViewportNoticeState {
  readonly dismissed = signal(false);
  dismiss(): void {
    this.dismissed.set(true);
  }
}

@Component({
  selector: 'app-narrow-viewport-notice',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (show()) {
      <div class="nvn" role="status">
        <span class="nvn-text">
          This lab isn’t optimized for small screens — it’s best used on a larger
          display. Everything still works here; this is just a heads-up.
        </span>
        <button type="button" class="nvn-x" (click)="dismiss()" aria-label="Dismiss">×</button>
      </div>
    }
  `,
  styles: [
    `
      .nvn {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin: 0 0 16px;
        padding: 10px 12px;
        background: #fef9c3;
        border: 1px solid #fde68a;
        border-radius: var(--radius-control, 6px);
        font-size: 0.8125rem;
        line-height: 1.4;
        color: #713f12;
      }
      .nvn-text { flex: 1; }
      .nvn-x {
        flex-shrink: 0;
        background: transparent;
        border: 0;
        cursor: pointer;
        font-size: 1rem;
        line-height: 1;
        color: #713f12;
        padding: 2px 4px;
      }
    `
  ]
})
export class NarrowViewportNotice implements OnDestroy {
  private state = inject(NarrowViewportNoticeState);
  private zone = inject(NgZone);

  private readonly narrow = signal(
    typeof window !== 'undefined' && window.innerWidth < BREAKPOINT_PX
  );

  readonly show = computed(() => this.narrow() && !this.state.dismissed());

  private readonly onResize = () => {
    this.zone.run(() => this.narrow.set(window.innerWidth < BREAKPOINT_PX));
  };

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResize);
    }
  }

  dismiss(): void {
    this.state.dismiss();
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize);
    }
  }
}
