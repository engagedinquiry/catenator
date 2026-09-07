import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PublicationStore } from '../core/publication-store';

/**
 * publication.metadata — the publication's own identity, edited as a form.
 *
 * micro.form-not-markdown: structured data, rendered as a form, no Preview tab.
 * mustNever "Confuse publication metadata with any individual topic's metadata":
 * this form writes ONLY store.meta — never a topic.
 */
@Component({
  selector: 'app-publication-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <h1>Publication</h1>
    <p class="lead">The publication's own metadata — separate from any individual topic.</p>

    <label for="pub-name">Display name</label>
    <input
      id="pub-name"
      type="text"
      [ngModel]="store.meta().displayName"
      (ngModelChange)="store.setMeta({ displayName: $event })"
      placeholder="e.g. API Platform Guide" />
  `
})
export class PublicationForm {
  readonly store = inject(PublicationStore);
}
