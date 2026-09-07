import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { parseSourcesFreetext } from '../core/parse-freetext';
import { SessionStore } from '../core/session-store';
import { SourceItem } from '../core/models';
import { downloadText, SOURCES_TEMPLATE } from '../ui/freetext-template';

/**
 * Step 2 — Sources. input-mode.dual: form OR free-text markdown, producing
 * identical data (micro.mode-parity). A single labeled record is ONE source
 * (mustNever "Split a single labeled record into multiple separate entries").
 *
 * micro.field-labels-and-placeholders: every field has a visible label AND
 * placeholder.
 * micro.advance-after-parse: once free text parses, "Continue" behaves exactly
 * like the form path.
 */
@Component({
  selector: 'app-sources-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <h2>Step 2 — Ground the topic with a source</h2>
    <p class="hint">One reference record. Enter it as a form or as markdown — both write the same fields.</p>

    <div class="toggle" role="tablist">
      <button type="button" [class.on]="mode() === 'form'" (click)="mode.set('form')">Form</button>
      <button type="button" [class.on]="mode() === 'text'" (click)="mode.set('text')">Free text</button>
    </div>

    @if (mode() === 'form') {
      <label for="s-title">Title</label>
      <input id="s-title" type="text" [(ngModel)]="title" placeholder="Short name for the source" />

      <label for="s-ref">Source</label>
      <input id="s-ref" type="text" [(ngModel)]="reference" placeholder="Where it comes from (e.g. ADR-014)" />

      <label for="s-desc">Description</label>
      <textarea id="s-desc" [(ngModel)]="description" placeholder="What it says, and what the reader should take from it"></textarea>
    } @else {
      <label for="s-free">Sources markdown</label>
      <textarea
        id="s-free"
        class="big"
        [(ngModel)]="freetext"
        placeholder="## Title&#10;…&#10;&#10;## Source&#10;…&#10;&#10;## Description&#10;…"></textarea>
      <div class="row">
        <button type="button" class="link" (click)="downloadTemplate()">Download template</button>
      </div>
    }

    @if (error()) { <div class="err">{{ error() }}</div> }

    <div class="actions">
      <button class="ghost" (click)="back()">← Back</button>
      <button (click)="next()">Continue →</button>
    </div>
  `
})
export class SourcesStep {
  private store = inject(SessionStore);
  private router = inject(Router);

  readonly mode = signal<'form' | 'text'>('form');
  readonly error = signal<string>('');

  private existing = this.store.sources()[0];
  title = this.existing?.title ?? '';
  reference = this.existing?.reference ?? '';
  description = this.existing?.description ?? '';
  freetext = '';

  private resolve(): SourceItem[] | null {
    if (this.mode() === 'text') {
      const parsed = parseSourcesFreetext(this.freetext);
      if (!parsed.ok) {
        this.error.set(parsed.errors.join(' '));
        return null;
      }
      return parsed.sources;
    }
    const one: SourceItem = {
      title: this.title.trim(),
      reference: this.reference.trim(),
      description: this.description.trim()
    };
    if (!one.title || !one.description) {
      this.error.set('Title and Description are required.');
      return null;
    }
    return [one];
  }

  next(): void {
    this.error.set('');
    const list = this.resolve();
    if (!list) return;
    this.store.setSources(list);
    this.router.navigate(['/personas']);
  }
  back(): void {
    this.router.navigate(['/topic']);
  }
  downloadTemplate(): void {
    downloadText('sources-template.md', SOURCES_TEMPLATE);
  }
}
