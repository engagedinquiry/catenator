import { Injectable, computed, signal } from '@angular/core';
import type {
  Dimension,
  Persona,
  Publication,
  PublicationMeta,
  RefractionCell,
  SelectionType,
  SourceItem,
  TopicNode,
  Variable
} from './models';
import { MAX_PERSONAS } from './models';
import { newId } from './ids';
import {
  addChildTopic,
  addRootTopic,
  countDescendants,
  deleteTopic,
  findTopic,
  moveSibling,
  updateTopic
} from './tree';
import { defaultModelFor } from './transports';

/**
 * The entire publication + workspace state, in memory for this session only
 * (no persistence anywhere — a refresh starts fresh).
 *
 * publication.metadata.default-selection-on-load: `selection` starts as
 * { type: 'publication' } so Panel 2 shows the publication form by default.
 *
 * persona.catalog.persona-id-is-positional: persona ids are "persona-0" /
 * "persona-1" by authoring order, assigned once here, never re-derived.
 * All OTHER ids (topics, sources) come from ids.ts and are equally stable.
 */
@Injectable({ providedIn: 'root' })
export class PublicationStore {
  readonly meta = signal<PublicationMeta>({ displayName: '' });
  readonly topics = signal<TopicNode[]>([]);
  readonly sources = signal<SourceItem[]>([]);
  readonly personas = signal<Persona[]>([]);
  readonly variables = signal<Variable[]>([]);

  /** publication-wide refraction grid, keyed by `${topicId}::${personaId}`. */
  readonly refractedOutputs = signal<Map<string, RefractionCell>>(new Map());

  /** positional persona counter — only ever increments. */
  private personaSeq = signal(0);

  /** Panel 1 selection. Defaults to the publication (default-selection-on-load). */
  readonly selection = signal<{ type: SelectionType; topicId?: string }>({ type: 'publication' });

  /** Settings — BYOK, session only. */
  readonly provider = signal<string>('claude');
  readonly apiKey = signal<string>('');
  readonly model = signal<string>(defaultModelFor('claude'));
  readonly hasApiKey = computed(() => this.apiKey().trim().length > 0);

  /** A plain snapshot of everything, for the pure core functions. */
  readonly publication = computed<Publication>(() => ({
    meta: this.meta(),
    topics: this.topics(),
    sources: this.sources(),
    personas: this.personas(),
    variables: this.variables()
  }));

  readonly selectedTopic = computed<TopicNode | null>(() => {
    const sel = this.selection();
    return sel.type === 'topic' && sel.topicId ? findTopic(this.topics(), sel.topicId) : null;
  });

  // ---- selection -----------------------------------------------------------
  select(type: SelectionType, topicId?: string): void {
    this.selection.set(topicId ? { type, topicId } : { type });
  }

  // ---- publication metadata ----------------------------------------------
  setMeta(patch: Partial<PublicationMeta>): void {
    this.meta.update((m) => ({ ...m, ...patch }));
  }

  // ---- topics (topic.hierarchy) -----------------------------------------
  addTopic(): void {
    const next = addRootTopic(this.topics());
    this.topics.set(next);
    this.select('topic', next[next.length - 1].id);
    this.invalidateRefractions();
  }

  addChild(parentId: string): void {
    const before = this.topics();
    const next = addChildTopic(before, parentId);
    this.topics.set(next);
    const parent = findTopic(next, parentId);
    if (parent && parent.children.length) this.select('topic', parent.children[parent.children.length - 1].id);
    this.invalidateRefractions();
  }

  /** How many descendant topics a delete would also remove (delete-warns-about-children). */
  descendantCount(id: string): number {
    return countDescendants(this.topics(), id);
  }

  removeTopic(id: string): void {
    this.topics.set(deleteTopic(this.topics(), id));
    if (this.selection().topicId === id) this.select('publication');
    this.invalidateRefractions();
  }

  move(id: string, direction: 'up' | 'down'): void {
    this.topics.set(moveSibling(this.topics(), id, direction));
  }

  patchTopic(id: string, patch: Partial<Pick<TopicNode, 'name' | 'content' | 'metadata' | 'sourceOverride'>>): void {
    this.topics.set(updateTopic(this.topics(), id, (t) => ({ ...t, ...patch })));
    this.invalidateRefractions();
  }

  // ---- sources (source.with-override) ---------------------------------
  addSource(): void {
    const s: SourceItem = { id: newId('source'), title: '', reference: '', description: '' };
    this.sources.update((list) => [...list, s]);
    this.select('sources');
    this.invalidateRefractions();
  }

  patchSource(id: string, patch: Partial<Omit<SourceItem, 'id'>>): void {
    this.sources.update((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    this.invalidateRefractions();
  }

  removeSource(id: string): void {
    this.sources.update((list) => list.filter((s) => s.id !== id));
    // an override on any topic that named this id becomes dangling — that is a
    // quality-check finding, not a silent rewrite here.
    this.invalidateRefractions();
  }

  // ---- variables (variable.substitution) -----------------------------
  addVariable(): void {
    this.variables.update((list) => [...list, { name: '', value: '' }]);
    this.select('variables');
  }

  patchVariable(index: number, patch: Partial<Variable>): void {
    this.variables.update((list) => list.map((v, i) => (i === index ? { ...v, ...patch } : v)));
    this.invalidateRefractions();
  }

  removeVariable(index: number): void {
    this.variables.update((list) => list.filter((_, i) => i !== index));
    this.invalidateRefractions();
  }

  // ---- personas (persona.catalog) -----------------------------------
  readonly canAddPersona = computed(() => this.personas().length < MAX_PERSONAS);

  addPersona(): void {
    if (this.personas().length >= MAX_PERSONAS) return; // max-two-personas
    const id = `persona-${this.personaSeq()}`;
    this.personaSeq.update((n) => n + 1);
    this.personas.update((list) => [...list, { id, name: '', summary: '', dimensions: [] }]);
    this.select('personas');
    this.invalidateRefractions();
  }

  patchPersona(id: string, patch: Partial<Pick<Persona, 'name' | 'summary'>>): void {
    // id is NEVER in the patch — positional, assigned once.
    this.personas.update((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    this.invalidateRefractions();
  }

  toggleDimension(id: string, dim: Dimension): void {
    this.personas.update((list) =>
      list.map((p) => {
        if (p.id !== id) return p;
        const has = p.dimensions.includes(dim);
        return { ...p, dimensions: has ? p.dimensions.filter((d) => d !== dim) : [...p.dimensions, dim] };
      })
    );
    this.invalidateRefractions();
  }

  removePersona(id: string): void {
    this.personas.update((list) => list.filter((p) => p.id !== id));
    // personaSeq is NOT decremented — a removed persona-1 slot stays "used" so a
    // re-added persona does not silently reuse a positional id already refracted.
    this.invalidateRefractions();
  }

  // ---- refraction results ---------------------------------------------
  setRefractions(cells: Map<string, RefractionCell>): void {
    this.refractedOutputs.set(new Map(cells));
  }

  private invalidateRefractions(): void {
    if (this.refractedOutputs().size) this.refractedOutputs.set(new Map());
  }

  setProvider(provider: string): void {
    this.provider.set(provider);
    this.model.set(defaultModelFor(provider) || this.model());
  }

  reset(): void {
    this.meta.set({ displayName: '' });
    this.topics.set([]);
    this.sources.set([]);
    this.personas.set([]);
    this.variables.set([]);
    this.personaSeq.set(0);
    this.refractedOutputs.set(new Map());
    this.select('publication');
  }
}
