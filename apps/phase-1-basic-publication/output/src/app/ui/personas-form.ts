import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FIXED_DIMENSIONS } from '../core/models';
import type { Dimension } from '../core/models';
import { PublicationStore } from '../core/publication-store';

/**
 * persona.catalog — up to two publication-wide personas, edited as a form.
 * Identical constraints to phase-0-single-topic's persona model.
 *
 * micro.max-two-personas: the "Add persona" button is hidden once two exist
 * (store.canAddPersona) AND store.addPersona() itself refuses a third.
 * micro.five-fixed-dimensions: the checkbox list is exactly FIXED_DIMENSIONS
 * from this app's models.ts (mirror of this app's system.yaml).
 * micro.persona-id-is-positional: the id is shown read-only; no control edits it.
 * micro.publication-level-not-per-topic: this is the only persona editor; there
 * is no per-topic persona list anywhere.
 */
@Component({
  selector: 'app-personas-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <h1>Personas</h1>
    <p class="lead">Up to two, shared across every topic. At least one is required before refraction.</p>

    @for (p of store.personas(); track p.id) {
      <div class="card">
        <span class="hint">{{ p.id }}</span>

        <label [attr.for]="'p-name-' + p.id">Name</label>
        <input
          [id]="'p-name-' + p.id"
          type="text"
          [ngModel]="p.name"
          (ngModelChange)="store.patchPersona(p.id, { name: $event })"
          placeholder="e.g. First-time integrator" />

        <label [attr.for]="'p-sum-' + p.id">Summary</label>
        <textarea
          [id]="'p-sum-' + p.id"
          [ngModel]="p.summary"
          (ngModelChange)="store.patchPersona(p.id, { summary: $event })"
          placeholder="What this reader needs and already knows"></textarea>

        <label>Dimensions</label>
        <div class="dims">
          @for (d of dimensions; track d) {
            <label>
              <input type="checkbox" [checked]="p.dimensions.includes(d)" (change)="store.toggleDimension(p.id, d)" />
              {{ d }}
            </label>
          }
        </div>

        <button type="button" class="link" (click)="store.removePersona(p.id)">Remove persona</button>
      </div>
    } @empty {
      <p class="hint">No personas yet.</p>
    }

    <div class="actions">
      <span></span>
      @if (store.canAddPersona()) {
        <button (click)="store.addPersona()">＋ Add persona</button>
      } @else {
        <span class="hint">Two personas is the maximum.</span>
      }
    </div>
  `
})
export class PersonasForm {
  readonly store = inject(PublicationStore);
  readonly dimensions = FIXED_DIMENSIONS as readonly Dimension[];
}
