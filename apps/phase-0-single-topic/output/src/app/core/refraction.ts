/**
 * byok-compiler.contract — call an AI model with topic + sources + one persona
 * and return one refracted text.
 *
 * mustNever:
 *  - "Invent a value not present in topic text or sources"      -> system prompt hard rule
 *  - "Depend on a specific model provider"                      -> RefractionTransport injection;
 *                                                                 Anthropic & Gemini both live in
 *                                                                 ./transports/, neither imported here
 *  - "Fail silently on a call error"                            -> refractOnce returns a discriminated
 *                                                                 union; callers must handle {ok:false}
 *  - "Add content/sections/suggestions beyond what dimensions
 *     and topic/sources call for"                               -> system prompt no-scope rules
 *  - "Reference or imply material outside what was provided"    -> system prompt disclosure rule
 *
 * micro:
 *  - missing-value-behavior: state explicitly what is not specified, do not guess
 *  - model-agnostic: same input/output contract regardless of provider
 *  - call-failure-behavior: auto-retry the same call exactly once; on second
 *    failure return errorOutput; never present a failure as an empty success;
 *    log the raw response on malformed-response
 *  - no-unrequested-scope / no-speculation-about-external-material: prompt rules
 *
 * Framework-agnostic on purpose — plain functions, no Angular imports.
 */

import type { CompilerError, Dimension, Persona, SourceItem } from '../model/models';

export interface RefractionInput {
  topicText: string;
  sources: SourceItem[];
  persona: Persona;
}

export interface RefractionRequest extends RefractionInput {
  apiKey: string;
  provider: string;
  model: string;
}

export interface RefractionResult {
  personaId: string;
  personaName: string;
  output: string;
  provider: string;
  model: string;
}

export type RefractionOutcome =
  | { ok: true; result: RefractionResult }
  | { ok: false; error: CompilerError };

/**
 * Provider-agnostic transport. An implementation takes the same request and
 * returns the model's text, or throws a TransportError. Any provider whose
 * implementation satisfies this shape is valid (build-config: Claude, Gemini).
 */
export type RefractionTransport = (
  req: RefractionRequest,
  system: string,
  user: string
) => Promise<string>;

export class TransportError extends Error {
  readonly kind: CompilerError['type'];
  readonly retryable: boolean;
  readonly raw?: unknown;

  constructor(kind: CompilerError['type'], message: string, retryable: boolean, raw?: unknown) {
    super(message);
    this.name = 'TransportError';
    this.kind = kind;
    this.retryable = retryable;
    this.raw = raw;
  }
}

const DIMENSION_DIRECTION: Record<Dimension, string> = {
  Surface:
    'Surface: choose format and density for this reader — prose, code, tables, or lists — and cut anything they would not read.',
  Content:
    'Content: set the posture — conceptual, procedural, or analytical — to match what this reader needs to do with the topic.',
  Context:
    'Context: frame the opening around what this reader is doing and the decision or task in front of them.',
  Time: 'Time: respect this reader’s reading budget; lead with what matters most to them if the budget is short.',
  Trust:
    'Trust: match the evidence bar — plain assertion, explicit source references, or "traces to the topic text" attribution.'
};

export function buildSystemPrompt(): string {
  return [
    'You are a refraction compiler. You are given one conceptual topic (with sources) and one reader persona.',
    'Re-express the SAME topic for that specific reader. Change framing, ordering, format, depth, tone and emphasis to fit them.',
    'Hard rule: never introduce a fact, number, name, capability, header, status code or claim that is not present in the supplied topic text or sources. No invention, no outside knowledge, no illustrative examples that assert new specifics.',
    'If the topic text does not specify something this reader would want, say plainly that it is not specified here. Do not fill the gap, and do not say where such a value might otherwise be found or that other documentation exists — only what THIS input does or does not contain.',
    'Answer only what the topic, the sources, and this persona’s stated dimensions require. Do not add extra sections, "you might also want to know" asides, or suggestions about related topics that are not in the input.',
    'Keep the output as short as correctly serving this persona allows — do not pad with unrequested elaboration.',
    'Return only the refracted piece as Markdown. No preamble, no notes about what you changed.'
  ].join('\n');
}

export function buildPrompt(input: RefractionInput): string {
  const { topicText, sources, persona } = input;
  const dims = persona.dimensions.length
    ? persona.dimensions.map((d) => `- ${DIMENSION_DIRECTION[d]}`).join('\n')
    : '- (no dimensions selected — use your judgement, still within the hard rule)';

  const sourceBlock = sources.length
    ? sources
        .map(
          (s, i) =>
            `Source ${i + 1}:\n  Title: ${s.title || '(none given)'}\n  Reference: ${
              s.reference || '(none given)'
            }\n  Description: ${s.description || '(none given)'}`
        )
        .join('\n')
    : '(no sources given)';

  return [
    '## Sources',
    sourceBlock,
    '',
    '## Reader persona',
    `Name: ${persona.name}`,
    `Summary: ${persona.summary || '(none given)'}`,
    'Dimensions to refract along:',
    dims,
    '',
    '## Topic text (the only source of facts, together with the sources above)',
    topicText.trim(),
    '',
    '## Task',
    `Write the refracted version of this topic for "${persona.name}". Markdown only.`
  ].join('\n');
}

function toCompilerError(e: unknown): CompilerError {
  if (e instanceof TransportError) {
    return { type: e.kind, message: e.message, retryable: e.retryable };
  }
  const message = e instanceof Error ? e.message : String(e);
  return { type: 'network', message, retryable: true };
}

/**
 * Run one refraction. On network error, rate limit, or malformed response,
 * retry the exact same call once automatically. If the retry also fails,
 * return { ok: false, error }. Never returns an empty successful result.
 */
export async function refractOnce(
  req: RefractionRequest,
  transport: RefractionTransport
): Promise<RefractionOutcome> {
  const system = buildSystemPrompt();
  const user = buildPrompt(req);

  let lastError: CompilerError | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const text = (await transport(req, system, user)).trim();
      if (!text) {
        throw new TransportError('malformed-response', 'Model returned an empty response.', true);
      }
      return {
        ok: true,
        result: {
          personaId: req.persona.id,
          personaName: req.persona.name,
          output: text,
          provider: req.provider,
          model: req.model
        }
      };
    } catch (e) {
      if (e instanceof TransportError && e.kind === 'malformed-response') {
        // Log the raw response so a malformed-response failure can be diagnosed.
        console.error('[byok-compiler] malformed response (raw):', e.raw ?? e.message);
      }
      lastError = toCompilerError(e);
      if (!lastError.retryable) break;
    }
  }
  return { ok: false, error: lastError ?? { type: 'network', message: 'Unknown error', retryable: false } };
}
