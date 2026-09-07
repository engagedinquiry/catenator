import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PublicationStore } from '../core/publication-store';

/**
 * source.with-override — the publication's source list, edited as a form.
 * Same shape as phase-0-single-topic: title, reference, description (plus a
 * stable id used by per-topic overrides).
 *
 * micro.form-not-markdown: no Preview tab.
 * The per-topic override itself is edited on the topic (see topic-editor.ts) —
 * this form is only the shared list.
 */
@Component({
  selector: 'app-sources-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <h1>Sources</h1>
    <p class="lead">
      Available by default to every topic. A topic can narrow this set for itself
      in its Metadata tab — that never changes the sources other topics see.
    </p>

    @for (s of store.sources(); track s.id) {
      <div class="card">
        <label [attr.for]="'s-title-' + s.id">Title</label>
        <input
          [id]="'s-title-' + s.id"
          type="text"
          [ngModel]="s.title"
          (ngModelChange)="store.patchSource(s.id, { title: $event })"
          placeholder="e.g. Understanding rate limiting" />

        <label [attr.for]="'s-ref-' + s.id">Reference</label>
        <input
          [id]="'s-ref-' + s.id"
          type="text"
          [ngModel]="s.reference"
          (ngModelChange)="store.patchSource(s.id, { reference: $event })"
          placeholder="e.g. ADR-014" />

        <label [attr.for]="'s-desc-' + s.id">Description</label>
        <textarea
          [id]="'s-desc-' + s.id"
          [ngModel]="s.description"
          (ngModelChange)="store.patchSource(s.id, { description: $event })"
          placeholder="What this source establishes"></textarea>

        <div class="row">
          <span class="hint">id: {{ s.id }}</span>
          <button type="button" class="link" (click)="store.removeSource(s.id)">Remove</button>
        </div>
      </div>
    } @empty {
      <p class="hint">No sources yet.</p>
    }

    <div class="actions">
      <span></span>
      <button (click)="store.addSource()">＋ Add source</button>
    </div>
  `
})
export class SourcesForm {
  readonly store = inject(PublicationStore);
}
