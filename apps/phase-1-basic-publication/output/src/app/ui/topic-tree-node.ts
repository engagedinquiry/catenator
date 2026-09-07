import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import type { TopicNode } from '../core/models';
import { PublicationStore } from '../core/publication-store';

/**
 * One node of the Topics tree in Panel 1, rendered recursively — the component
 * references itself for `children`, so it supports any depth
 * (topic.hierarchy.recursive-not-fixed-depth). Nothing here counts or caps
 * levels.
 *
 * Per-topic actions: add child topic, delete, move up, move down.
 *  - move up/down call store.move(), which reorders siblings only
 *    (move-reorders-siblings-only) and is a no-op at the ends.
 *  - delete opens an INLINE confirmation (never a modal — system.yaml
 *    mustNever) showing the descendant count (delete-warns-about-children).
 */
@Component({
  selector: 'app-topic-tree-node',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="node" [style.--depth]="depth()">
      <div class="row" [class.selected]="isSelected()">
        <button type="button" class="name" (click)="store.select('topic', topic().id)" [title]="topic().name || 'Unnamed topic'">
          {{ topic().name || 'Unnamed topic' }}
        </button>
        <span class="acts">
          <button type="button" class="mini" title="Add child topic" (click)="store.addChild(topic().id)">＋</button>
          <button type="button" class="mini" title="Move up" (click)="store.move(topic().id, 'up')">↑</button>
          <button type="button" class="mini" title="Move down" (click)="store.move(topic().id, 'down')">↓</button>
          <button type="button" class="mini danger" title="Delete topic" (click)="askDelete()">✕</button>
        </span>
      </div>

      @if (confirming()) {
        <div class="confirm">
          @if (descendants() > 0) {
            Delete “{{ topic().name || 'Unnamed topic' }}” and its
            {{ descendants() }} descendant topic{{ descendants() === 1 ? '' : 's' }}?
          } @else {
            Delete “{{ topic().name || 'Unnamed topic' }}”?
          }
          <span class="confirm-acts">
            <button type="button" class="mini danger" (click)="doDelete()">Delete</button>
            <button type="button" class="mini" (click)="confirming.set(false)">Cancel</button>
          </span>
        </div>
      }

      @for (child of topic().children; track child.id) {
        <app-topic-tree-node [topic]="child" [depth]="depth() + 1" />
      }
    </div>
  `,
  styles: [
    `
      .row {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 3px 6px 3px calc(6px + var(--depth, 0) * 14px);
        border-radius: var(--radius-control);
      }
      .row.selected { background: var(--accent-blue-light); }
      .row:hover { background: #f1f5f9; }
      .row.selected:hover { background: var(--accent-blue-light); }
      .name {
        flex: 1;
        min-width: 0;
        text-align: left;
        background: transparent;
        border: 0;
        padding: 2px 0;
        color: var(--text-body);
        font: inherit;
        font-size: 0.8125rem;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .row.selected .name { color: var(--accent-blue-strong); font-weight: 600; }
      .acts { display: none; gap: 2px; flex-shrink: 0; }
      .row:hover .acts, .row.selected .acts { display: inline-flex; }
      .mini {
        background: transparent;
        border: 1px solid transparent;
        border-radius: var(--radius-control);
        padding: 1px 5px;
        font-size: 0.75rem;
        line-height: 1.2;
        color: var(--text-muted);
        cursor: pointer;
      }
      .mini:hover { background: var(--canvas-bg); border-color: var(--border-control); color: var(--text-title); }
      .mini.danger:hover { color: #b91c1c; border-color: #fecaca; }
      .confirm {
        margin: 2px 6px 6px calc(6px + var(--depth, 0) * 14px);
        padding: 8px 10px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: var(--radius-control);
        font-size: 0.75rem;
        color: #7f1d1d;
      }
      .confirm-acts { display: flex; gap: 4px; margin-top: 6px; }
    `
  ]
})
export class TopicTreeNode {
  readonly store = inject(PublicationStore);
  readonly topic = input.required<TopicNode>();
  readonly depth = input<number>(0);

  readonly confirming = signal(false);

  readonly isSelected = computed(() => {
    const sel = this.store.selection();
    return sel.type === 'topic' && sel.topicId === this.topic().id;
  });
  readonly descendants = computed(() => this.store.descendantCount(this.topic().id));

  askDelete(): void {
    this.confirming.set(true);
  }

  doDelete(): void {
    this.confirming.set(false);
    this.store.removeTopic(this.topic().id);
  }
}
