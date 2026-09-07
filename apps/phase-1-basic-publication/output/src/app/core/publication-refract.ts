import type { CompilerError, Publication, RefractionCell } from './models';
import type { RefractionTransport } from './transports';
import { refractionKey } from './models';
import { flattenTopics } from './tree';
import { resolveSourcesForTopic } from './sources';
import { refractOnce } from './refraction';
import { checkGrounding } from './grounding';

/**
 * refraction.publication-level — ONE author action refracts every topic in the
 * tree for every persona.
 *
 * mustNever:
 *  - "Require a separate action per topic" -> refractPublication() is the single
 *     entry point; it loops (topic × persona) internally (one-action-many-calls).
 *  - "Invent a value not present in a topic's own content plus its resolved
 *     sources" -> after each successful call, checkGrounding() runs against that
 *     topic's content + resolved sources; an ungrounded result is converted to a
 *     visible { type: 'ungrounded-claim' } error and is NOT returned as text.
 *  - "Depend on a specific model provider" -> the transport is passed in; this
 *     file imports only the RefractionTransport interface.
 *
 * micro.resolved-sources-per-topic: each call uses resolveSourcesForTopic(),
 * i.e. the publication default or that topic's own override.
 * micro.same-failure-behavior-as-phase-0: each call is one refractOnce() —
 * retry-once then a structured error — and a failure on one (topic × persona)
 * pair never aborts the loop; every other pair still runs.
 */
export interface RefractProgress {
  done: number;
  total: number;
  cell: RefractionCell;
}

export interface RefractPublicationResult {
  /** keyed by refractionKey(topicId, personaId). */
  cells: Map<string, RefractionCell>;
  /** true only if persona-exists holds — refraction never runs otherwise. */
  ran: boolean;
}

const NO_PERSONAS: CompilerError = {
  type: 'network',
  message: 'Refraction needs at least one persona (quality-check.persona-exists).',
  retryable: false
};

export async function refractPublication(
  pub: Publication,
  transport: RefractionTransport,
  apiKey: string,
  model: string,
  onProgress?: (p: RefractProgress) => void
): Promise<RefractPublicationResult> {
  const cells = new Map<string, RefractionCell>();

  // quality-check.four-checks.persona-exists gates this entirely.
  if (pub.personas.length === 0) {
    return { cells, ran: false };
  }

  const topics = flattenTopics(pub.topics);
  const total = topics.length * pub.personas.length;
  let done = 0;

  for (const topic of topics) {
    const resolvedSources = resolveSourcesForTopic(topic, pub.sources);
    for (const persona of pub.personas) {
      const key = refractionKey(topic.id, persona.id);
      let cell: RefractionCell;

      const r = await refractOnce(transport, apiKey, model, {
        topicText: topic.content,
        sources: resolvedSources,
        persona
      });

      if (!r.ok) {
        cell = { topicId: topic.id, personaId: persona.id, ok: false, error: r.error };
      } else {
        const grounding = checkGrounding(r.text, topic.content, resolvedSources);
        if (grounding.grounded) {
          cell = { topicId: topic.id, personaId: persona.id, ok: true, text: r.text };
        } else {
          cell = {
            topicId: topic.id,
            personaId: persona.id,
            ok: false,
            error: {
              type: 'ungrounded-claim',
              message:
                `The model's output for this topic introduced ${grounding.ungrounded.length} ` +
                `claim(s) not found in the topic content or its resolved sources: ` +
                grounding.ungrounded.join(', ') + '. It was not kept.',
              retryable: true
            }
          };
        }
      }

      cells.set(key, cell);
      done += 1;
      onProgress?.({ done, total, cell });
      // a failure here does not `throw` — the loop continues to the next pair.
    }
  }

  return { cells, ran: true };
}

export { NO_PERSONAS };
