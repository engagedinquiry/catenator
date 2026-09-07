import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PublicationStore } from '../core/publication-store';
import { RefractBar } from './refract-bar';
import { PublicationForm } from './publication-form';
import { VariablesForm } from './variables-form';
import { SourcesForm } from './sources-form';
import { PersonasForm } from './personas-form';
import { TopicEditor } from './topic-editor';

/**
 * editor.generic — ONE Panel 2 component that renders whatever is selected in
 * Panel 1, inline.
 *
 * mustNever:
 *  - "Show a Preview tab for structured data" -> Publication / Variables /
 *     Sources / Personas render a plain form component; only <app-topic-editor>
 *     has the Metadata / Editor / Preview tabs (renderModes).
 *  - "Open any selection in a modal dialog" -> every branch below is an inline
 *     child component; there is no dialog / overlay anywhere.
 *
 * micro.default-on-load: PublicationStore.selection defaults to
 * { type: 'publication' }, so this shows <app-publication-form> on first load.
 */
@Component({
  selector: 'app-editor-generic',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RefractBar, PublicationForm, VariablesForm, SourcesForm, PersonasForm, TopicEditor],
  template: `
    <div class="pane">
      <app-refract-bar />
      @switch (sel().type) {
        @case ('publication') { <app-publication-form /> }
        @case ('variables') { <app-variables-form /> }
        @case ('sources') { <app-sources-form /> }
        @case ('personas') { <app-personas-form /> }
        @case ('topic') {
          @if (store.selectedTopic(); as t) {
            <app-topic-editor [topicId]="t.id" />
          } @else {
            <p class="lead">That topic no longer exists. Pick another item from the left.</p>
          }
        }
      }
    </div>
  `,
  styles: [`.pane { max-width: 760px; margin: 0 auto; padding: 24px 28px 80px; }`]
})
export class EditorGeneric {
  readonly store = inject(PublicationStore);
  readonly sel = this.store.selection;
}
