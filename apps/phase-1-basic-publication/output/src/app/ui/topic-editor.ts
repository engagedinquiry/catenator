import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { TopicNode } from '../core/models';
import { PublicationStore } from '../core/publication-store';
import { findTopic } from '../core/tree';
import { MarkdownView } from './markdown-view';

/**
 * editor.generic renderMode for a Topic: markdown content with
 * Metadata / Editor / Preview tabs (matching the reference exactly).
 *
 * The Metadata tab carries the topic name and its per-topic source override
 * (source.with-override): "Use all publication sources" checked = default (all);
 * unchecked = an explicit id list, and only the checked sources apply — for this
 * topic only. A dangling override id is a Quality Check finding, not blocked here.
 *
 * No modal dialog — all of this is inline in Panel 2.
 */
@Component({
  selector: 'app-topic-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MarkdownView],
  template: `
    @if (topic(); as t) {
      <div class="tabs">
        <button type="button" [class.on]="tab() === 'metadata'" (click)="tab.set('metadata')">Metadata</button>
        <button type="button" [class.on]="tab() === 'editor'" (click)="tab.set('editor')">Editor</button>
        <button type="button" [class.on]="tab() === 'preview'" (click)="tab.set('preview')">Preview</button>
      </div>

      @switch (tab()) {
        @case ('metadata') {
          <label [attr.for]="'t-name-' + t.id">Topic name</label>
          <input
            [id]="'t-name-' + t.id"
            type="text"
            [ngModel]="t.name"
            (ngModelChange)="store.patchTopic(t.id, { name: $event })"
            placeholder="Topic name" />

          <label>Sources for this topic</label>
          <p class="hint">
            {{ t.sourceOverride === null
              ? 'Using every publication source (default).'
              : 'Overriding — only the checked sources below apply to this topic.' }}
          </p>
          <div class="dims">
            <label>
              <input
                type="checkbox"
                [checked]="t.sourceOverride === null"
                (change)="store.patchTopic(t.id, { sourceOverride: t.sourceOverride === null ? [] : null })" />
              Use all publication sources
            </label>
          </div>
          @if (store.sources().length) {
            <div class="src-list">
              @for (s of store.sources(); track s.id) {
                <label class="src">
                  <input
                    type="checkbox"
                    [disabled]="t.sourceOverride === null"
                    [checked]="isOverridden(t, s.id)"
                    (change)="toggleSource(t, s.id)" />
                  {{ s.title || '(untitled source)' }} <span class="hint">{{ s.id }}</span>
                </label>
              }
            </div>
          } @else {
            <p class="hint">No publication sources defined yet.</p>
          }
        }
        @case ('editor') {
          <label [attr.for]="'t-content-' + t.id">Content (markdown)</label>
          <textarea
            [id]="'t-content-' + t.id"
            class="big"
            [ngModel]="t.content"
            (ngModelChange)="store.patchTopic(t.id, { content: $event })"
            placeholder="Write this topic's content."></textarea>
        }
        @case ('preview') {
          @if (t.content.trim()) {
            <app-markdown-view [source]="t.content" />
          } @else {
            <p class="lead">Nothing to preview yet.</p>
          }
        }
      }
    }
  `,
  styles: [
    `
      .tabs { display: flex; gap: 2px; border-bottom: 1px solid var(--border-subtle); margin-bottom: 16px; }
      .tabs button {
        background: transparent;
        border: 0;
        border-bottom: 2px solid transparent;
        border-radius: 0;
        color: var(--text-muted);
        font-family: var(--font-display);
        font-size: 0.78rem;
        font-weight: 700;
        padding: 8px 12px;
      }
      .tabs button:hover { background: #f1f5f9; color: var(--text-title); }
      .tabs button.on { color: var(--accent-blue-strong); border-bottom-color: var(--accent-blue); }
      .src-list { display: flex; flex-direction: column; gap: 4px; margin-top: 6px; }
      .src { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; }
      .src input { width: auto; }
    `
  ]
})
export class TopicEditor {
  readonly store = inject(PublicationStore);
  readonly topicId = input.required<string>();

  readonly tab = signal<'metadata' | 'editor' | 'preview'>('editor');

  readonly topic = computed<TopicNode | null>(() => findTopic(this.store.topics(), this.topicId()));

  isOverridden(t: TopicNode, id: string): boolean {
    return t.sourceOverride !== null && t.sourceOverride.includes(id);
  }

  toggleSource(t: TopicNode, id: string): void {
    if (t.sourceOverride === null) return;
    const next = t.sourceOverride.includes(id)
      ? t.sourceOverride.filter((x) => x !== id)
      : [...t.sourceOverride, id];
    this.store.patchTopic(t.id, { sourceOverride: next });
  }
}
