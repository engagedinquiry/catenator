import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReaderStore } from '../state/reader-store';

/**
 * layout.reader-shell topic-list: left, fixed width (the width is set on the
 * shell container, not here, and does not react to content — micro.fixed-topic-
 * list-width). Each live row is a routerLink to /:personaId/:topicId
 * (navigation.routes micro.browser-navigable). A topic with a null file for the
 * current persona is shown but marked "Not covered" and non-navigable
 * (content.source micro.null-means-unavailable).
 */
@Component({
  selector: 'app-topic-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <nav class="topic-list" aria-label="Topics">
      <p class="list-label">Topics</p>
      @for (t of store.topics; track t.id) {
        @if (isDisabled(t.id)) {
          <span class="topic disabled" title="Not covered for this persona">
            {{ t.label }}
            <span class="tag">Not covered</span>
          </span>
        } @else {
          <a
            class="topic"
            [class.selected]="store.topicId() === t.id"
            [routerLink]="['/', store.personaId(), t.id]"
            [attr.aria-current]="store.topicId() === t.id ? 'true' : null">
            {{ t.label }}
          </a>
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
        text-decoration: none;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      a.topic:hover { background: #f1f5f9; color: var(--text-title); }
      a.topic.selected {
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
    return !this.store.availableTopicIds().has(topicId);
  }
}
