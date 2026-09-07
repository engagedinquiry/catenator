import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Dimension, FIXED_DIMENSIONS, MAX_PERSONAS } from '../core/models';
import { parsePersonasFreetext, PersonaDraft } from '../core/parse-freetext';
import { SessionStore } from '../core/session-store';
import { downloadText, PERSONAS_TEMPLATE } from '../ui/freetext-template';

/**
 * Step 3 — Personas. Up to MAX_PERSONAS (system.yaml mustNever ">2 personas").
 * input-mode.dual: form OR markdown, identical data. Dimensions are the five
 * fixed ones from system.yaml contentScope.fixedDimensions (FIXED_DIMENSIONS).
 *
 * micro.parse-only-what-is-stated: a dimension the free text doesn't name stays
 * unselected.
 */
@Component({
  selector: 'app-personas-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <h2>Step 3 — Name up to two readers</h2>
    <p class="hint">Each reader has a summary and any of the five fixed dimensions. Form or markdown.</p>

    <div class="toggle" role="tablist">
      <button type="button" [class.on]="mode() === 'form'" (click)="mode.set('form')">Form</button>
      <button type="button" [class.on]="mode() === 'text'" (click)="mode.set('text')">Free text</button>
    </div>

    @if (mode() === 'form') {
      @for (d of drafts; track $index) {
        <div class="card">
          <label [attr.for]="'p-name-' + $index">Persona name</label>
          <input [id]="'p-name-' + $index" type="text" [(ngModel)]="d.name" placeholder="Who this reader is" />

          <label [attr.for]="'p-sum-' + $index">Summary</label>
          <textarea [id]="'p-sum-' + $index" [(ngModel)]="d.summary" placeholder="What they know, what they need"></textarea>

          <label>Dimensions</label>
          <div class="dims">
            @for (dim of allDims; track dim) {
              <label>
                <input type="checkbox" [checked]="d.dimensions.includes(dim)" (change)="toggleDim(d, dim)" />
                {{ dim }}
              </label>
            }
          </div>
          @if (drafts.length > 1) {
            <div class="row"><button type="button" class="link" (click)="removeDraft($index)">Remove this persona</button></div>
          }
        </div>
      }
      @if (drafts.length < max) {
        <div class="row"><button type="button" class="ghost" (click)="addDraft()">+ Add a second persona</button></div>
      }
    } @else {
      <label for="p-free">Personas markdown</label>
      <textarea
        id="p-free"
        class="big"
        [(ngModel)]="freetext"
        placeholder="## First reader&#10;summary paragraph…&#10;&#10;Content, Context&#10;&#10;## Second reader&#10;…"></textarea>
      <div class="row"><button type="button" class="link" (click)="downloadTemplate()">Download template</button></div>
    }

    @if (error()) { <div class="err">{{ error() }}</div> }

    <div class="actions">
      <button class="ghost" (click)="back()">← Back</button>
      <button (click)="next()">Continue →</button>
    </div>
  `
})
export class PersonasStep {
  private store = inject(SessionStore);
  private router = inject(Router);

  readonly allDims = FIXED_DIMENSIONS;
  readonly max = MAX_PERSONAS;
  readonly mode = signal<'form' | 'text'>('form');
  readonly error = signal<string>('');

  drafts: PersonaDraft[] = this.store.personas().length
    ? this.store.personas().map((p) => ({ name: p.name, summary: p.summary, dimensions: [...p.dimensions] }))
    : [{ name: '', summary: '', dimensions: [] }];
  freetext = '';

  toggleDim(d: PersonaDraft, dim: Dimension): void {
    d.dimensions = d.dimensions.includes(dim)
      ? d.dimensions.filter((x) => x !== dim)
      : FIXED_DIMENSIONS.filter((x) => d.dimensions.includes(x) || x === dim);
  }
  addDraft(): void {
    if (this.drafts.length < this.max) this.drafts = [...this.drafts, { name: '', summary: '', dimensions: [] }];
  }
  removeDraft(i: number): void {
    this.drafts = this.drafts.filter((_, x) => x !== i);
  }

  private resolve(): PersonaDraft[] | null {
    if (this.mode() === 'text') {
      const parsed = parsePersonasFreetext(this.freetext);
      if (!parsed.ok) {
        this.error.set(parsed.errors.join(' '));
        return null;
      }
      if (parsed.personas.length > this.max) {
        this.error.set(`This lab allows at most ${this.max} personas.`);
        return null;
      }
      return parsed.personas;
    }
    const filled = this.drafts.filter((d) => d.name.trim() && d.summary.trim());
    if (filled.length === 0) {
      this.error.set('Give at least one persona a name and a summary.');
      return null;
    }
    return filled;
  }

  next(): void {
    this.error.set('');
    const list = this.resolve();
    if (!list) return;
    this.store.setPersonas(list);
    this.router.navigate(['/refract']);
  }
  back(): void {
    this.router.navigate(['/sources']);
  }
  downloadTemplate(): void {
    downloadText('personas-template.md', PERSONAS_TEMPLATE);
  }
}
