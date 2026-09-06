import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { parsePersonas } from '../core/parse-freetext';
import { SessionStore } from '../core/session-store';
import { DIMENSIONS, DIMENSION_HINTS, Dimension, MAX_PERSONAS, Persona, emptyPersona } from '../model/models';
import { downloadText, PERSONAS_TEMPLATE } from '../ui/freetext-template';

type Mode = 'form' | 'text';

/**
 * Step 3 — Personas and dimensions (input-mode.dual).
 *
 * system.yaml mustNever "Allow more than 2 personas per topic": the form caps
 * "Add persona" at MAX_PERSONAS and resolve() slices to it; the free-text
 * parser slices to it too.
 *
 * Free-text mode is markdown: "## <name>" heading is the name, the paragraph
 * after it is the summary, a comma-separated line of known dimension names is
 * the dimensions list. A dimension not written is not selected.
 */
@Component({
  selector: 'app-personas-step',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h2>Step 3 — Identify personas and dimensions</h2>
    <p class="hint">Up to {{ max }} readers. For each, pick which of the five dimensions the refraction should bend along.</p>

    <div class="toggle">
      <button [class.on]="mode() === 'form'" (click)="mode.set('form')">Structured form</button>
      <button [class.on]="mode() === 'text'" (click)="mode.set('text')">Free text</button>
    </div>

    @if (mode() === 'form') {
      @for (p of list(); track p.id; let i = $index) {
        <div class="card">
          <div style="display:flex;justify-content:space-between">
            <strong>Persona {{ i + 1 }}</strong>
            <button class="ghost" (click)="remove(i)">Remove</button>
          </div>
          <label [attr.for]="'p-name-' + i">Name</label>
          <input [id]="'p-name-' + i" type="text" [(ngModel)]="p.name" placeholder="e.g. First-time integrator" />
          <label [attr.for]="'p-sum-' + i">Summary — who they are and what they read for</label>
          <input [id]="'p-sum-' + i" type="text" [(ngModel)]="p.summary" placeholder="e.g. New to the concept; needs the why before any code" />
          <label>Dimensions</label>
          <div class="dims">
            @for (d of dimensions; track d) {
              <label [title]="hints[d]">
                <input type="checkbox" [checked]="p.dimensions.includes(d)" (change)="toggleDim(p, d)" />
                {{ d }}
              </label>
            }
          </div>
        </div>
      }
      @if (list().length < max) {
        <button class="ghost" style="margin-top:12px" (click)="add()">+ Add persona</button>
      }
    } @else {
      <div class="card">
        <label for="p-raw">Free-text personas (markdown, max {{ max }})</label>
        <textarea id="p-raw" class="big" [(ngModel)]="raw" (ngModelChange)="reparse()"
          placeholder="## First-time integrator&#10;&#10;New to the concept; needs the why before any code.&#10;&#10;Content, Context&#10;&#10;## Experienced developer&#10;&#10;Knows the concept; just wants this system's exact values.&#10;&#10;Content, Trust"></textarea>
        <p class="hint">
          <button type="button" class="link" (click)="downloadTemplate()">Download blank template (.md)</button>
        </p>
        <p class="hint">Parsed: {{ parsedSummary() }}</p>
      </div>
    }

    @if (error()) { <p class="err">{{ error() }}</p> }

    <div class="actions">
      <button class="ghost" (click)="back()">← Back</button>
      <button (click)="next()">Continue →</button>
    </div>
  `
})
export class PersonasStep {
  private store = inject(SessionStore);
  private router = inject(Router);

  readonly max = MAX_PERSONAS;
  readonly dimensions = DIMENSIONS;
  readonly hints = DIMENSION_HINTS;

  mode = signal<Mode>('form');
  list = signal<Persona[]>(
    this.store.personas().length
      ? this.store.personas().map((p) => ({ ...p, dimensions: [...p.dimensions] }))
      : [emptyPersona('persona-1')]
  );
  raw = '';
  parsed = signal<Persona[]>([]);
  error = signal<string>('');

  parsedSummary = computed(() =>
    this.parsed().length
      ? this.parsed().map((p) => `${p.name} [${p.dimensions.join(', ') || 'no dims'}]`).join(' · ')
      : '—'
  );

  reparse(): void {
    this.parsed.set(parsePersonas(this.raw));
  }

  downloadTemplate(): void {
    downloadText('catenator-personas-template.md', PERSONAS_TEMPLATE);
  }

  add(): void {
    if (this.list().length >= this.max) return;
    this.list.update((l) => [...l, emptyPersona(`persona-${l.length + 1}`)]);
  }

  remove(i: number): void {
    this.list.update((l) => l.filter((_, idx) => idx !== i));
  }

  toggleDim(p: Persona, d: Dimension): void {
    p.dimensions = p.dimensions.includes(d)
      ? p.dimensions.filter((x) => x !== d)
      : DIMENSIONS.filter((x) => x === d || p.dimensions.includes(x)); // keep canonical order
  }

  private resolve(): Persona[] {
    const raw = this.mode() === 'form' ? this.list() : parsePersonas(this.raw);
    return raw
      .map((p, i) => ({
        id: p.id || `persona-${i + 1}`,
        name: p.name.trim(),
        summary: p.summary.trim(),
        dimensions: p.dimensions
      }))
      .filter((p) => p.name.length > 0)
      .slice(0, this.max);
  }

  next(): void {
    const personas = this.resolve();
    if (personas.length === 0) {
      this.error.set('Add at least one persona with a name.');
      return;
    }
    const ids = new Set(personas.map((p) => p.id));
    if (ids.size !== personas.length) {
      personas.forEach((p, i) => (p.id = `persona-${i + 1}`));
    }
    this.store.setPersonas(personas);
    this.router.navigate(['/refract']);
  }

  back(): void {
    this.router.navigate(['/sources']);
  }
}
