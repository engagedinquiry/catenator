import { computed, Injectable, signal } from '@angular/core';
import { MAX_PERSONAS, Persona, Refraction, SourceItem } from '../model/models';
import { defaultModelFor } from './transports';

/**
 * state.topic-refraction — the entire app state.
 *
 * mustNever:
 *  - "Lose or overwrite author-entered data between steps"  -> setters only replace
 *     a field on an explicit author action; navigation never clears anything
 *  - "Persist data beyond the current session"              -> in-memory signals only;
 *     nothing touches localStorage / disk, so a refresh restarts the flow
 *
 * micro.refracted-output-map: refractedOutputs is keyed by personaId, one
 * entry per persona, never merged.
 */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  /** Step 1 — the one topic (system.yaml mustNever: >1 topic per lab instance). */
  readonly topicText = signal<string>('');
  /** Step 2 — sources (phase-0: 0 or 1 records). */
  readonly sources = signal<SourceItem[]>([]);
  /** Step 3 — personas, hard-capped at MAX_PERSONAS on write. */
  readonly personas = signal<Persona[]>([]);
  /** Step 4 — refracted outputs, keyed by personaId. */
  readonly refractedOutputs = signal<Map<string, Refraction>>(new Map());
  /** Step 4 — verifier's grounding acknowledgement, keyed by personaId. */
  readonly groundingApproved = signal<Set<string>>(new Set());

  /** Settings — BYOK, session-only. */
  readonly provider = signal<string>('claude');
  readonly apiKey = signal<string>('');
  readonly model = signal<string>(defaultModelFor('claude'));

  /** Synthetic id for the single in-session topic — used by delivery.request-response. */
  readonly topicId = computed(() => {
    const title = this.sources()[0]?.title ?? '';
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    let hash = 0;
    const text = this.topicText();
    for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) | 0;
    const suffix = Math.abs(hash).toString(36).slice(0, 6);
    return `${slug || 'topic'}-${suffix}`;
  });

  readonly refractions = computed<Refraction[]>(() =>
    this.personas()
      .map((p) => this.refractedOutputs().get(p.id))
      .filter((r): r is Refraction => !!r)
  );

  readonly hasTopic = computed(() => this.topicText().trim().length > 0);
  readonly hasSources = computed(() => {
    const s = this.sources()[0];
    return !!s && s.title.trim().length > 0 && s.description.trim().length > 0;
  });
  readonly hasPersonas = computed(() => this.personas().length > 0);
  readonly hasRefractions = computed(() => this.refractions().length === this.personas().length && this.personas().length > 0);
  readonly hasApiKey = computed(() => this.apiKey().trim().length > 0);

  setTopic(text: string): void {
    const value = text.trim();
    if (value === this.topicText()) return;
    this.topicText.set(value);
    // The topic is the only source of facts — changing it invalidates everything
    // downstream. This is an explicit author edit, not a navigation side effect.
    this.sources.set([]);
    this.personas.set([]);
    this.refractedOutputs.set(new Map());
    this.groundingApproved.set(new Set());
  }

  setSources(list: SourceItem[]): void {
    this.sources.set(
      list.map((s) => ({
        title: s.title.trim(),
        reference: s.reference.trim(),
        description: s.description.trim()
      }))
    );
  }

  setPersonas(list: Persona[]): void {
    this.personas.set(list.slice(0, MAX_PERSONAS));
    // Personas changed — existing refractions are stale.
    this.refractedOutputs.set(new Map());
    this.groundingApproved.set(new Set());
  }

  putRefraction(r: Refraction): void {
    const next = new Map(this.refractedOutputs());
    next.set(r.personaId, r); // one entry per personaId, never merged
    this.refractedOutputs.set(next);
    const approved = new Set(this.groundingApproved());
    approved.delete(r.personaId); // fresh output must be re-verified
    this.groundingApproved.set(approved);
  }

  approveGrounding(personaId: string): void {
    const next = new Set(this.groundingApproved());
    next.add(personaId);
    this.groundingApproved.set(next);
  }

  setProvider(provider: string): void {
    this.provider.set(provider);
    this.model.set(defaultModelFor(provider) || this.model());
  }

  reset(): void {
    this.topicText.set('');
    this.sources.set([]);
    this.personas.set([]);
    this.refractedOutputs.set(new Map());
    this.groundingApproved.set(new Set());
  }
}
