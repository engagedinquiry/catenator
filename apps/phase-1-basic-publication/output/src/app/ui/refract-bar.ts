import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { refractionKey } from '../core/models';
import type { RefractionCell } from '../core/models';
import { PublicationStore } from '../core/publication-store';
import { flattenTopics } from '../core/tree';
import { transportFor } from '../core/transports';
import { refractPublication } from '../core/publication-refract';

/**
 * refraction.publication-level — the ONE action, pinned at the top of Panel 2.
 *
 * micro.one-action-many-calls: a single click calls refractPublication(), which
 * loops every (topic × persona) pair internally.
 * quality-check.persona-exists gate: the button is disabled unless
 * store.personas().length > 0 (mustNever "Allow refraction to run if the
 * persona-exists check fails").
 * mustNever "Depend on a specific model provider": the transport is looked up by
 * store.provider() via transportFor(); no vendor is named here.
 *
 * Results render inline, below the bar (never a modal) — grouped by topic, one
 * block per persona, showing the refracted text or the structured error
 * (same-failure-behavior-as-phase-0; an ungrounded result is surfaced as an
 * error, not shown as text).
 */
@Component({
  selector: 'app-refract-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="bar">
      <button
        (click)="run()"
        [disabled]="running() || !canRefract()"
        [title]="disabledReason()">
        {{ running() ? 'Refracting…' : 'Refract publication' }}
      </button>

      @if (running()) {
        <span class="prog">{{ progress().done }} / {{ progress().total }}</span>
      } @else if (!store.hasApiKey()) {
        <span class="note">No API key. <a routerLink="/settings" class="link">Add one →</a></span>
      } @else if (!hasPersonas()) {
        <span class="note">Add at least one persona first.</span>
      } @else if (!hasTopics()) {
        <span class="note">Add at least one topic first.</span>
      } @else if (summary(); as s) {
        <span class="note">{{ s.ok }} refracted, {{ s.failed }} failed.</span>
      }
    </div>

    @if (cells().size > 0 && !running()) {
      <div class="results">
        @for (t of topics(); track t.id) {
          <div class="topic-block">
            <h3>{{ t.name || 'Unnamed topic' }}</h3>
            @for (p of store.personas(); track p.id) {
              <div class="cell">
                <div class="cell-hd">{{ p.name || p.id }}</div>
                @if (cellFor(t.id, p.id); as c) {
                  @if (c.ok) {
                    <pre class="out">{{ c.text }}</pre>
                  } @else {
                    <div class="err">{{ c.error?.type }}: {{ c.error?.message }}</div>
                  }
                } @else {
                  <div class="hint">Not refracted.</div>
                }
              </div>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      .bar {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        padding: 10px 0 14px;
        border-bottom: 1px solid var(--border-subtle);
        margin-bottom: 16px;
      }
      .prog { font-size: 0.8125rem; color: var(--text-muted); font-family: var(--font-mono); }
      .note { font-size: 0.8125rem; color: var(--text-muted); }
      .link { color: var(--accent-blue); font-weight: 700; text-decoration: none; }
      .results { margin-bottom: 20px; }
      .topic-block { margin-bottom: 18px; }
      .topic-block h3 { font-family: var(--font-display); font-size: 0.95rem; color: var(--text-title); margin: 0 0 8px; }
      .cell { margin-bottom: 10px; }
      .cell-hd { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 700; color: var(--text-muted); margin-bottom: 4px; }
    `
  ]
})
export class RefractBar {
  readonly store = inject(PublicationStore);

  readonly running = signal(false);
  readonly progress = signal<{ done: number; total: number }>({ done: 0, total: 0 });

  readonly cells = computed(() => this.store.refractedOutputs());
  readonly topics = computed(() => flattenTopics(this.store.topics()));
  readonly hasPersonas = computed(() => this.store.personas().length > 0);
  readonly hasTopics = computed(() => this.topics().length > 0);
  readonly canRefract = computed(() => this.store.hasApiKey() && this.hasPersonas() && this.hasTopics());

  readonly summary = computed(() => {
    const all = [...this.cells().values()];
    if (all.length === 0) return null;
    return { ok: all.filter((c) => c.ok).length, failed: all.filter((c) => !c.ok).length };
  });

  disabledReason(): string {
    if (!this.store.hasApiKey()) return 'Add an API key in Settings first.';
    if (!this.hasPersonas()) return 'Add at least one persona first (persona-exists check).';
    if (!this.hasTopics()) return 'Add at least one topic first.';
    return 'Refract every topic for every persona';
  }

  cellFor(topicId: string, personaId: string): RefractionCell | undefined {
    return this.cells().get(refractionKey(topicId, personaId));
  }

  async run(): Promise<void> {
    if (!this.canRefract() || this.running()) return;
    const transport = transportFor(this.store.provider());
    if (!transport) return;

    this.running.set(true);
    this.progress.set({ done: 0, total: this.topics().length * this.store.personas().length });
    try {
      const result = await refractPublication(
        this.store.publication(),
        transport,
        this.store.apiKey(),
        this.store.model(),
        (p) => this.progress.set({ done: p.done, total: p.total })
      );
      this.store.setRefractions(result.cells);
    } finally {
      this.running.set(false);
    }
  }
}
