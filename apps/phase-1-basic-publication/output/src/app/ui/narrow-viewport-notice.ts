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
 * layout.three-panel.narrow-viewport-notification — below 768px viewport width,
 * show a dismissible notification that the app is not optimized for small
 * screens. "Identical behavior to phase-0-single-topic's layout.three-panel rule
 * of the same name." Notice ONLY: the three-panel layout does not restructure,
 * collapse, or hide anything at this breakpoint.
 *
 * Once dismissed it does not reappear for the rest of the session (in-memory
 * only); it may reappear on a fresh session (a real page reload).
 */
const BREAKPOINT_PX = 768;

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
          This workspace isn’t optimized for small screens — it’s best used on a
          larger display. Everything still works here; this is just a heads-up.
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
        margin: 0;
        padding: 10px 14px;
        background: #fef9c3;
        border-bottom: 1px solid #fde68a;
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
    if (typeof window !== 'undefined') window.addEventListener('resize', this.onResize);
  }

  dismiss(): void {
    this.state.dismiss();
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') window.removeEventListener('resize', this.onResize);
  }
}
