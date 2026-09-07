import { HttpError, MalformedResponseError } from './transports/errors';
import type { CompilerError, Persona, SourceItem } from './models';
import type { RefractionTransport } from './transports';

/**
 * byok-compiler.contract — call an AI model with topic + sources + one persona,
 * return one refracted text. Provider-agnostic: this file imports only the
 * transport INTERFACE, never a concrete vendor (micro.model-agnostic).
 *
 * contractShape:
 *   input:  { topicText, sources[], persona {name, summary, dimensions[]} }
 *   output: refractedText
 *   error:  { type: network|rate-limit|malformed-response, message, retryable }
 */
export interface RefractInput {
  topicText: string;
  sources: SourceItem[];
  persona: Pick<Persona, 'name' | 'summary' | 'dimensions'>;
}

export type RefractResult =
  | { ok: true; text: string }
  | { ok: false; error: CompilerError; rawLog?: string };

/**
 * micro.no-unrequested-scope + no-speculation-about-external-material +
 * missing-value-behavior: the prompt tells the model to answer only what the
 * persona's dimensions and the provided input require, to state absent facts as
 * absent, and to never imply material outside the input.
 */
export function buildPrompt(input: RefractInput): string {
  const sources = input.sources
    .map(
      (s, i) =>
        `Source ${i + 1}\n  Title: ${s.title}\n  Reference: ${s.reference}\n  Description: ${s.description}`
    )
    .join('\n\n');

  return [
    'You are refracting one conceptual topic for one specific reader.',
    '',
    'TOPIC (the only source of facts):',
    input.topicText.trim(),
    '',
    'SOURCES (grounding material — the only other source of facts):',
    sources || '  (none provided)',
    '',
    'READER:',
    `  Name: ${input.persona.name}`,
    `  Summary: ${input.persona.summary}`,
    `  Dimensions to shape for: ${input.persona.dimensions.join(', ') || '(none selected)'}`,
    '',
    'RULES — follow every one:',
    '- Use ONLY facts stated in the TOPIC or SOURCES above. Never invent a value.',
    '- If the reader would need a fact that is not specified, state plainly that',
    '  this input does not specify it. Never say where it might otherwise be found,',
    '  and never imply the existence of any documentation or material beyond what',
    '  is provided here.',
    '- Answer only what this reader\'s dimensions and the provided input require.',
    '  No extra sections, no "you might also want to know", no speculative asides,',
    '  no suggestions about related topics not present in the input.',
    '- Be as short as correctly serving this reader allows. Do not pad.',
    '',
    'Write the refracted text now, and nothing else.'
  ].join('\n');
}

/** Classify a thrown transport error into the structured errorOutput shape. */
function classify(err: unknown): CompilerError {
  if (err instanceof HttpError) {
    if (err.status === 429) return { type: 'rate-limit', message: `Rate limited (HTTP 429).`, retryable: true };
    return { type: 'network', message: `Provider returned HTTP ${err.status}.`, retryable: true };
  }
  if (err instanceof MalformedResponseError) {
    return { type: 'malformed-response', message: 'The model response could not be parsed.', retryable: true };
  }
  return { type: 'network', message: err instanceof Error ? err.message : 'Network error.', retryable: true };
}

/**
 * micro.call-failure-behavior: on failure, retry the exact same call ONCE with no
 * user action. If the retry also fails, return errorOutput (surfaced visibly by
 * the caller, not console-only). Never retry more than once. Never present a
 * failure as an empty success. Log the raw response on malformed-response.
 *
 * micro.no-unrequested-scope etc. are enforced by buildPrompt().
 */
export async function refractOnce(
  transport: RefractionTransport,
  apiKey: string,
  model: string,
  input: RefractInput
): Promise<RefractResult> {
  const prompt = buildPrompt(input);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const text = await transport.complete(prompt, apiKey, model);
      const trimmed = text.trim();
      if (!trimmed) {
        // an empty body is a malformed response, not a successful empty result
        throw new MalformedResponseError(JSON.stringify(text));
      }
      return { ok: true, text: trimmed };
    } catch (err) {
      const isLastAttempt = attempt === 1;
      if (!isLastAttempt) continue; // automatic single retry, same call
      const error = classify(err);
      const rawLog =
        err instanceof MalformedResponseError ? err.raw : err instanceof HttpError ? err.body : undefined;
      if (error.type === 'malformed-response' && rawLog) {
        // log the raw API response so the failure can be diagnosed
        console.error('[byok-compiler] malformed model response:', rawLog);
      }
      return { ok: false, error, rawLog };
    }
  }
  // unreachable
  return { ok: false, error: { type: 'network', message: 'unreachable', retryable: false } };
}
