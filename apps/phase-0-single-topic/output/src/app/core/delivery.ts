import { checkGrounding } from './grounding';
import type { DeliveryError, SourceItem } from './models';

/**
 * delivery.request-response — return a specific persona's refracted output on
 * request, after a grounding gate.
 *
 * contractShape: input [topicId, personaId] -> refractedText | structured error.
 *
 * mustNever:
 *  - "Return a different persona's output than the one requested" -> lookup is
 *     `refractedOutputs.get(personaId)` and nothing else (micro.exact-persona-match).
 *  - "Return output for a persona that hasn't been refracted yet" -> a missing
 *     entry returns {type: not-yet-refracted}.
 *  - "Ask the reader to supply a topicId" -> topicId is a parameter of this
 *     contract but the UI passes the one implicit topic id; the reader only ever
 *     picks a persona (micro.topic-id-implicit-in-single-topic-scope).
 *  - "Serve a persona's output without first running check.grounding" -> every
 *     call runs checkGrounding; an ungrounded specific claim => {type:
 *     ungrounded-claim} and the output is NOT delivered (micro.grounding-gate).
 */
export interface DeliveryRequest {
  topicId: string;
  personaId: string;
}

export type DeliveryResponse =
  | { ok: true; text: string }
  | { ok: false; error: DeliveryError };

export function deliver(
  req: DeliveryRequest,
  refractedOutputs: ReadonlyMap<string, string>,
  topicText: string,
  sources: SourceItem[]
): DeliveryResponse {
  const output = refractedOutputs.get(req.personaId);
  if (output === undefined) {
    return {
      ok: false,
      error: { type: 'not-yet-refracted', message: 'This reader has no refracted output yet. Run Refract first.' }
    };
  }

  // micro.grounding-gate: run every time, so drift is caught even if Refract's
  // output changed between runs.
  const grounding = checkGrounding(output, topicText, sources);
  if (!grounding.grounded) {
    return {
      ok: false,
      error: {
        type: 'ungrounded-claim',
        message:
          `This output contains a specific claim not traceable to the topic or sources ` +
          `(${grounding.ungrounded.join(', ')}). It was not delivered.`
      }
    };
  }

  return { ok: true, text: output };
}
