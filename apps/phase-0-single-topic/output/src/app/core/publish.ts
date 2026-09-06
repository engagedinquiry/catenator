/**
 * delivery.request-response — return a specific persona's refracted output on
 * request.
 *
 * mustNever:
 *  - "Return a different persona's output than the one requested"
 *  - "Return output for a persona that hasn't been refracted yet"
 *  - "Ask the reader to supply a topicId in the UI" — the caller passes the one
 *     existing topic's id implicitly; the UI never shows a topic input
 *  - "Display a persona name using its data-structure syntax"
 *
 * micro.exact-persona-match: the response comes from the refractedOutputs map,
 * keyed exactly by the requested personaId.
 * micro.topic-id-implicit-in-single-topic-scope: topicId stays in the contract
 * (future multi-topic phases) but is supplied automatically here.
 *
 * check.grounding gate: a persona with unresolved ungrounded claims cannot be
 * delivered until the verifier has acknowledged them (groundingApproved).
 */

import type { Refraction } from '../model/models';

export interface DeliveryRequest {
  /** Supplied automatically by the app — never entered by the reader. */
  topicId: string;
  personaId: string;
}

export type DeliveryResponse =
  | {
      ok: true;
      topicId: string;
      personaId: string;
      personaName: string;
      provider: string;
      model: string;
      output: string;
    }
  | { ok: false; error: { type: 'unknown-topic' | 'not-yet-refracted' | 'ungrounded-claim'; message: string } };

export interface DeliveryContext {
  sessionTopicId: string;
  /** Keyed by personaId — the state.topic-refraction refractedOutputs map. */
  refractedOutputs: Map<string, Refraction>;
  /** personaIds whose grounding the verifier has acknowledged. */
  groundingApproved: Set<string>;
  /** personaIds that still have unresolved ungrounded claims. */
  ungroundedPersonaIds: Set<string>;
}

export function resolveDelivery(req: DeliveryRequest, ctx: DeliveryContext): DeliveryResponse {
  if (req.topicId !== ctx.sessionTopicId) {
    return { ok: false, error: { type: 'unknown-topic', message: `Unknown topic id "${req.topicId}".` } };
  }

  const match = ctx.refractedOutputs.get(req.personaId);
  if (!match) {
    return {
      ok: false,
      error: { type: 'not-yet-refracted', message: `Persona "${req.personaId}" has not been refracted yet.` }
    };
  }

  if (ctx.ungroundedPersonaIds.has(req.personaId) && !ctx.groundingApproved.has(req.personaId)) {
    return {
      ok: false,
      error: {
        type: 'ungrounded-claim',
        message:
          `Refraction for "${match.personaName}" has claims that could not be traced to the topic or sources. ` +
          `Review them on the Refract step and confirm before delivery.`
      }
    };
  }

  return {
    ok: true,
    topicId: ctx.sessionTopicId,
    personaId: match.personaId,
    personaName: match.personaName,
    provider: match.provider,
    model: match.model,
    output: match.output
  };
}
