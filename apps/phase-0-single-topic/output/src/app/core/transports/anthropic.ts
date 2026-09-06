/**
 * Anthropic (Claude) transport for byok-compiler.contract.
 *
 * One of two interchangeable implementations of RefractionTransport. The
 * compiler core (../refraction.ts) does not import this file — it is selected
 * at call time by provider, so nothing in the contract depends on Claude.
 */

import { RefractionRequest, RefractionTransport, TransportError } from '../refraction';

const API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>;
  error?: { type: string; message: string };
}

export const anthropicTransport: RefractionTransport = async (
  req: RefractionRequest,
  system: string,
  user: string
): Promise<string> => {
  let res: Response;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': req.apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: req.model,
        max_tokens: 2048,
        system,
        messages: [{ role: 'user', content: user }]
      })
    });
  } catch (e) {
    throw new TransportError('network', e instanceof Error ? e.message : String(e), true, e);
  }

  const rawBody = await res.text();
  let data: AnthropicResponse;
  try {
    data = JSON.parse(rawBody) as AnthropicResponse;
  } catch {
    throw new TransportError('malformed-response', `Non-JSON response (HTTP ${res.status}).`, true, rawBody);
  }

  if (res.status === 429) {
    throw new TransportError('rate-limit', data.error?.message ?? 'Rate limited (HTTP 429).', true, rawBody);
  }
  if (!res.ok || data.error) {
    const msg = data.error?.message ?? `HTTP ${res.status}`;
    const retryable = res.status >= 500;
    throw new TransportError('network', `Claude API error: ${msg}`, retryable, rawBody);
  }

  const output = (data.content ?? [])
    .filter((b) => b.type === 'text' && b.text)
    .map((b) => b.text!.trim())
    .join('\n\n')
    .trim();

  if (!output) {
    throw new TransportError('malformed-response', 'Claude response contained no text block.', true, rawBody);
  }
  return output;
};
