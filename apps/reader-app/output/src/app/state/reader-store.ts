import { computed, Injectable, signal } from '@angular/core';
import { deliver, DeliveryResponse } from '../core/delivery';
import { TOPIC_MAP, topicsForPersona } from '../core/content-source';
import { PERSONA_CATALOG, personaById } from '../core/persona-catalog';

/**
 * Delivery cache for the persona/topic routes.
 *
 * Since navigation.routes made persona and topic real URL segments, the route
 * is the source of truth — `setRoute()` is called by PersonaPage from its route
 * inputs, and this store just fetches and caches the delivered content.
 *
 * system.yaml mustNever:
 *  - "Infer a persona for the reader" -> setRoute() only ever uses the personaId
 *     that is literally in the URL; an unknown one yields hasValidPersona=false
 *     and PersonaPage redirects home rather than guessing.
 *  - "Track the reader's choice across sessions" -> in-memory signals only.
 *
 * content.source micro.topic-persists-across-persona-switch: the persona
 * switcher navigates to /:newPersona/:sameTopic, so the topic segment carries
 * across — this store does not need to remember it.
 */
@Injectable({ providedIn: 'root' })
export class ReaderStore {
  readonly personas = PERSONA_CATALOG;
  readonly topics = TOPIC_MAP;

  readonly personaId = signal<string | null>(null);
  readonly topicId = signal<string>('start');
  readonly loading = signal<boolean>(false);
  readonly response = signal<DeliveryResponse | null>(null);

  readonly hasValidPersona = computed(() => this.personaId() !== null && !!personaById(this.personaId()!));

  readonly availableTopicIds = computed(() => {
    const id = this.personaId();
    return id ? topicsForPersona(id) : new Set<string>();
  });

  /** Called by PersonaPage whenever the route params change. */
  async setRoute(personaId: string, topicId: string | undefined): Promise<void> {
    const nextTopic = topicId ?? 'start';
    if (this.personaId() === personaId && this.topicId() === nextTopic && this.response()) return;
    this.personaId.set(personaId);
    this.topicId.set(nextTopic);
    await this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    const res = await deliver({ topicId: this.topicId(), personaId: this.personaId() });
    this.response.set(res);
    this.loading.set(false);
  }
}
