import { computed, Injectable, signal } from '@angular/core';
import { deliver, DeliveryResponse } from '../core/delivery';
import { TOPIC_MAP, topicsForPersona } from '../core/content-source';
import { PERSONA_CATALOG } from '../core/persona-catalog';

/**
 * The whole app state for reader-controlled delivery.
 *
 * system.yaml mustNever:
 *  - "Infer a persona for the reader" -> personaId starts null and only a
 *     selectPersona() call (an explicit click) ever sets it.
 *  - "Track the reader's choice across sessions" -> in-memory signals only;
 *     nothing touches localStorage / disk, so every visit starts persona-less.
 *
 * delivery.request-response micro.default-on-load: topicId defaults to "start",
 * personaId to null.
 * content.source micro.topic-persists-across-persona-switch: selectPersona()
 * never changes topicId.
 */
@Injectable({ providedIn: 'root' })
export class ReaderStore {
  readonly personas = PERSONA_CATALOG;
  readonly topics = TOPIC_MAP;

  /** null until the reader explicitly picks a persona. */
  readonly personaId = signal<string | null>(null);
  readonly topicId = signal<string>('start');

  readonly loading = signal<boolean>(false);
  readonly response = signal<DeliveryResponse | null>(null);

  readonly hasPersona = computed(() => this.personaId() !== null);

  /** topic ids that have a file for the current persona (others render disabled). */
  readonly availableTopicIds = computed(() => {
    const id = this.personaId();
    return id ? topicsForPersona(id) : new Set<string>();
  });

  selectPersona(id: string): void {
    if (this.personaId() === id) return;
    this.personaId.set(id); // topicId deliberately untouched — topic persists
    void this.load();
  }

  selectTopic(id: string): void {
    if (this.topicId() === id) return;
    this.topicId.set(id);
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    const res = await deliver({ topicId: this.topicId(), personaId: this.personaId() });
    this.response.set(res);
    this.loading.set(false);
  }
}
