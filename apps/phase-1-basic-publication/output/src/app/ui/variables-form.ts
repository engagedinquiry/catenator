import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PublicationStore } from '../core/publication-store';

/**
 * variable.substitution — publication-level name/value pairs, edited as a form.
 *
 * micro.form-not-markdown: no Preview tab.
 * mustNever "Resolve or substitute a variable's value live while typing": this
 * form only stores name/value — it never renders {{name}} against a topic.
 * mustNever "Allow a topic to define its own local variable": the only place
 * variables are created is here, at publication level.
 */
@Component({
  selector: 'app-variables-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <h1>Variables</h1>
    <p class="lead">
      Publication-level name/value pairs. Reference one inside topic content as
      <code>{{ ref }}</code> (case-sensitive). Not substituted while you type —
      Quality Check verifies references.
    </p>

    @for (v of store.variables(); track $index) {
      <div class="card">
        <div class="row">
          <div style="flex:1">
            <label [attr.for]="'v-name-' + $index">Name</label>
            <input
              [id]="'v-name-' + $index"
              type="text"
              [ngModel]="v.name"
              (ngModelChange)="store.patchVariable($index, { name: $event })"
              placeholder="e.g. product_name" />
          </div>
          <div style="flex:1">
            <label [attr.for]="'v-val-' + $index">Value</label>
            <input
              [id]="'v-val-' + $index"
              type="text"
              [ngModel]="v.value"
              (ngModelChange)="store.patchVariable($index, { value: $event })"
              placeholder="e.g. Acme API" />
          </div>
        </div>
        <button type="button" class="link" (click)="store.removeVariable($index)">Remove</button>
      </div>
    } @empty {
      <p class="hint">No variables yet.</p>
    }

    <div class="actions">
      <span></span>
      <button (click)="store.addVariable()">＋ Add variable</button>
    </div>
  `
})
export class VariablesForm {
  readonly store = inject(PublicationStore);
  /** literal shown in the hint, kept out of the template so it is not parsed as a binding. */
  readonly ref = '{{name}}';
}
