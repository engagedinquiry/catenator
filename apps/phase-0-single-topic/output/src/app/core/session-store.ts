import { computed, Injectable, signal } from '@angular/core';
import { Dimension, MAX_PERSONAS, Persona, SourceItem } from './models';
import { defaultModelFor } from './transports';

/**
 * state.topic-refraction — the entire lab state, in memory for the current
 * session only.
 *
 * mustNever:
 *  - "Lose or overwrite author-entered data between steps" -> setters only run
 *     on an explicit author action; navigation never clears anything.
 *  - "Persist data beyond the current session" -> signals only, nothing touches
 *     localStorage / disk; a refresh restarts the flow.
 *
 * micro.persona-id-is-positional: id is "persona-<n>" by authoring order,
 * assigned once when the persona is added, unchanged on later edits.
 * micro.refracted-output-map: refractedOutputs is keyed by that positional id,
 * one entry per persona, never merged.
 */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  /** Step 1 — the one topic (system.yaml mustNever: >1 topic per lab instance). */
  readonly topicText = signal<string>('');
  /** Step 2 — sources (phase-0: a single labeled record). */
  readonly sources = signal<SourceItem[]>([]);
  /** Step 3 — personas, hard-capped at MAX_PERSONAS. */
  readonly personas = signal<Persona[]>([]);
  /** Step 4 — refracted outputs, keyed by positional persona id. */
  readonly refractedOutputs = signal<Map<string, string>>(new Map());
  /** running total of personas ever added — so ids stay unique + positional. */
  private personaSeq = signal(0);

  /** Settings — BYOK, session-only. */
  readonly provider = signal<string>('claude');
  readonly apiKey = signal<string>('');
  readonly model = signal<string>(defaultModelFor('claude'));

  /** delivery.request-response: the one implicit topic id, never shown to a reader. */
  readonly topicId = computed(() => {
    let hash = 0;
    const text = this.topicText();
    for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) | 0;
    return `topic-${Math.abs(hash).toString(36).slice(0, 8) || '0'}`;
  });

  readonly hasTopic = computed(() => this.topicText().trim().length > 0);
  readonly hasSources = computed(() => {
    const s = this.sources()[0];
    return !!s && s.title.trim().length > 0 && s.description.trim().length > 0;
  });
  readonly hasPersonas = computed(() => this.personas().length > 0);
  readonly allRefracted = computed(() => {
    const ps = this.personas();
    return ps.length > 0 && ps.every((p) => this.refractedOutputs().has(p.id));
  });
  readonly hasApiKey = computed(() => this.apiKey().trim().length > 0);

  setTopic(text: string): void {
    const value = text.trim();
    if (value === this.topicText()) return;
    this.topicText.set(value);
    // the topic is the only source of facts — changing it invalidates everything
    // downstream. Explicit author edit, not a navigation side effect.
    this.sources.set([]);
    this.personas.set([]);
    this.personaSeq.set(0);
    this.refractedOutputs.set(new Map());
  }

  setSources(list: SourceItem[]): void {
    this.sources.set(
      list.map((s) => ({ title: s.title.trim(), reference: s.reference.trim(), description: s.description.trim() }))
    );
  }

  /** Replace the persona list. Positional ids are assigned here, once each. */
  setPersonas(drafts: Array<{ name: string; summary: string; dimensions: Dimension[] }>): void {
    const capped = drafts.slice(0, MAX_PERSONAS);
    const existing = this.personas();
    const next: Persona[] = capped.map((d, i) => ({
      id: existing[i]?.id ?? `persona-${this.nextId()}`,
      name: d.name.trim(),
      summary: d.summary.trim(),
      dimensions: d.dimensions
    }));
    this.personas.set(next);
    // personas changed -> any existing refractions are stale
    this.refractedOutputs.set(new Map());
  }

  private nextId(): number {
    const n = this.personaSeq();
    this.personaSeq.set(n + 1);
    return n;
  }

  putRefraction(personaId: string, text: string): void {
    const next = new Map(this.refractedOutputs());
    next.set(personaId, text); // one entry per personaId, never merged
    this.refractedOutputs.set(next);
  }

  setProvider(provider: string): void {
    this.provider.set(provider);
    this.model.set(defaultModelFor(provider) || this.model());
  }

  reset(): void {
    this.topicText.set('');
    this.sources.set([]);
    this.personas.set([]);
    this.personaSeq.set(0);
    this.refractedOutputs.set(new Map());
  }
}
