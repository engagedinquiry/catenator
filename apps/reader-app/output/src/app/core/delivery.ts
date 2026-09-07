/**
 * delivery.request-response — return the correct file's content for a given
 * topic + persona pair.
 *
 * contractShape:
 *   input:  { topicId, personaId }   (both explicit — micro.both-explicit)
 *   output: { kind: 'content', markdown }
 *   error:  { kind: 'not-available-for-persona', message }
 *           { kind: 'no-persona-selected', message }
 *           { kind: 'not-found', message }
 *
 * mustNever:
 *  - "Return content for a persona/topic pair other than what was requested"
 *     -> the url comes solely from content-source.fileFor(topicId, personaId).
 *  - "Guess a persona if the reader hasn't explicitly chosen one"
 *     -> personaId === null short-circuits to {kind:'no-persona-selected'}.
 */
import { fileFor, topicById } from './content-source';

export interface DeliveryRequest {
  topicId: string;
  /** null until the reader explicitly picks a persona. */
  personaId: string | null;
}

export type DeliveryResponse =
  | { kind: 'content'; markdown: string }
  | { kind: 'no-persona-selected'; message: string }
  | { kind: 'not-available-for-persona'; message: string }
  | { kind: 'not-found'; message: string };

export async function deliver(
  req: DeliveryRequest,
  fetchText: (url: string) => Promise<string> = defaultFetchText
): Promise<DeliveryResponse> {
  const topic = topicById(req.topicId);
  if (!topic) {
    return { kind: 'not-found', message: `Unknown topic "${req.topicId}".` };
  }

  if (req.personaId === null) {
    return {
      kind: 'no-persona-selected',
      message: 'Choose a persona to read this topic.'
    };
  }

  const lookup = fileFor(req.topicId, req.personaId);
  if (!lookup.available) {
    return {
      kind: 'not-available-for-persona',
      message: `"${topic.label}" is not covered for this persona.`
    };
  }

  try {
    const markdown = await fetchText(lookup.url);
    return { kind: 'content', markdown };
  } catch {
    return {
      kind: 'not-found',
      message: `"${topic.label}" is listed for this persona but its file could not be loaded.`
    };
  }
}

async function defaultFetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}
