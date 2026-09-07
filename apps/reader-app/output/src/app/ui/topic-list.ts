import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReaderStore } from '../state/reader-store';

/**
 * The topic list — always visible as its own selector, separate from the
 * persona switcher (delivery.request-response micro.both-explicit).
 *
 * content.source micro.null-means-unavailable: a topic with a null file for the
 * current persona is shown, but marked "Not covered" and non-selectable rather
 * than hidden or broken. Before a persona is chosen, every topic is shown plain
 * (only "start" yields content).
 */
@Component({
  selector: 'app-topic-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="topic-list" aria-label="Topics">
      <p class="list-label">Topic</p>
      @for (t of store.topics; track t.id) {
        @if (isDisabled(t.id)) {
          <span class="topic disabled" [attr.title]="'Not covered for this persona'">
            {{ t.label }}
            <span class="tag">Not covered</span>
          </span>
        } @else {
          <button
            type="button"
            class="topic"
            [class.selected]="store.topicId() === t.id"
            [attr.aria-current]="store.topicId() === t.id ? 'true' : null"
            (click)="store.selectTopic(t.id)">
            {{ t.label }}
          </button>
        }
      }
    </nav>
  `,
  styles: [
    `
      .topic-list { display: flex; flex-direction: column; gap: 2px; padding: 12px; }
      .list-label {
        margin: 0 0 4px;
        font-family: var(--font-display);
        font-size: 0.6875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-muted);
      }
      .topic {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        text-align: left;
        width: 100%;
        background: transparent;
        color: var(--text-muted);
        border: 1px solid transparent;
        border-radius: var(--radius-control);
        padding: 7px 10px;
        font-family: var(--font-display);
        font-size: 0.8125rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      button.topic:hover { background: #f1f5f9; color: var(--text-title); }
      button.topic.selected {
        background: var(--accent-blue-light);
        border-color: var(--accent-blue);
        color: var(--accent-blue-strong);
        font-weight: 700;
      }
      .topic.disabled { cursor: default; color: #94a3b8; }
      .tag {
        flex-shrink: 0;
        font-size: 0.5625rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 1px 6px;
        border-radius: var(--radius-pill);
        background: #f1f5f9;
        color: #94a3b8;
      }
    `
  ]
})
export class TopicList {
  readonly store = inject(ReaderStore);

  isDisabled(topicId: string): boolean {
    return this.store.hasPersona() && !this.store.availableTopicIds().has(topicId);
  }
}
