import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { parseSource } from '../core/parse-freetext';
import { SessionStore } from '../core/session-store';
import { emptySource, SourceItem } from '../model/models';
import { downloadText, SOURCES_TEMPLATE } from '../ui/freetext-template';

type Mode = 'form' | 'text';

/**
 * Step 2 — Sources (input-mode.dual).
 *
 * Both modes write the SAME { title, reference, description } record and are
 * checked by the SAME completion rule (title + description required). The
 * free-text mode is markdown with "## Title" / "## Source" / "## Description"
 * sections. Nothing is inferred — a missing section stays blank.
 */
@Component({
  selector: 'app-sources-step',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h2>Step 2 — Sources</h2>
    <p class="hint">Name the source behind this topic: a title, a source reference, and a description. Fill the form, or write it as markdown and let it be parsed into the same three fields.</p>

    <div class="toggle">
      <button [class.on]="mode() === 'form'" (click)="mode.set('form')">Structured form</button>
      <button [class.on]="mode() === 'text'" (click)="mode.set('text')">Free text</button>
    </div>

    @if (mode() === 'form') {
      <div class="card">
        <label for="s-title">Title</label>
        <input id="s-title" type="text" [(ngModel)]="form.title" placeholder="Short name for the source" />
        <label for="s-ref">Source reference</label>
        <input id="s-ref" type="text" [(ngModel)]="form.reference" placeholder="URL, doc name, ADR number, or system of record (optional)" />
        <label for="s-desc">Description</label>
        <textarea id="s-desc" [(ngModel)]="form.description" placeholder="What the source covers and why it matters"></textarea>
      </div>
    } @else {
      <div class="card">
        <label for="s-raw">Free-text sources (markdown)</label>
        <textarea id="s-raw" class="big" [(ngModel)]="raw" (ngModelChange)="reparse()"
          placeholder="## Title&#10;&#10;Short name for the source&#10;&#10;## Source&#10;&#10;URL, doc name, or ADR number&#10;&#10;## Description&#10;&#10;What the source covers and why it matters"></textarea>
        <p class="hint">
          <button type="button" class="link" (click)="downloadTemplate()">Download blank template (.md)</button>
        </p>
        <p class="hint">Parsed preview — title: <code>{{ preview().title || '—' }}</code>,
          source: <code>{{ preview().reference || '—' }}</code>,
          description: <code>{{ previewDesc() }}</code></p>
      </div>
    }

    @if (error()) { <p class="err">{{ error() }}</p> }

    <div class="actions">
      <button class="ghost" (click)="back()">← Back</button>
      <button (click)="next()">Continue →</button>
    </div>
  `
})
export class SourcesStep {
  private store = inject(SessionStore);
  private router = inject(Router);

  mode = signal<Mode>('form');
  form: SourceItem = this.store.sources()[0] ?? emptySource();
  raw = '';
  preview = signal<SourceItem>(emptySource());
  previewDesc = computed(() => {
    const d = this.preview().description || '—';
    return d.length > 80 ? d.slice(0, 80) + '…' : d;
  });
  error = signal<string>('');

  reparse(): void {
    this.preview.set(parseSource(this.raw));
  }

  downloadTemplate(): void {
    downloadText('catenator-sources-template.md', SOURCES_TEMPLATE);
  }

  private resolve(): SourceItem {
    return this.mode() === 'form' ? this.form : parseSource(this.raw);
  }

  next(): void {
    const s = this.resolve();
    if (!s.title.trim() || !s.description.trim()) {
      this.error.set('Title and description are both required.');
      return;
    }
    this.store.setSources([s]);
    this.router.navigate(['/personas']);
  }

  back(): void {
    this.router.navigate(['/topic']);
  }
}
