/**
 * Google (Gemini) transport for byok-compiler.contract.
 *
 * The second interchangeable implementation of RefractionTransport. Same
 * input/output contract as the Anthropic transport — this is what "model-
 * agnostic" means concretely: swapping this in changes nothing for the
 * compiler core or any caller.
 */

import { RefractionRequest, RefractionTransport, TransportError } from '../refraction';

function endpoint(model: string, apiKey: string): string {
  const m = model || 'gemini-2.5-flash';
  return `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { code?: number; message?: string; status?: string };
}

export const geminiTransport: RefractionTransport = async (
  req: RefractionRequest,
  system: string,
  user: string
): Promise<string> => {
  let res: Response;
  try {
    res = await fetch(endpoint(req.model, req.apiKey), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens: 2048 }
      })
    });
  } catch (e) {
    throw new TransportError('network', e instanceof Error ? e.message : String(e), true, e);
  }

  const rawBody = await res.text();
  let data: GeminiResponse;
  try {
    data = JSON.parse(rawBody) as GeminiResponse;
  } catch {
    throw new TransportError('malformed-response', `Non-JSON response (HTTP ${res.status}).`, true, rawBody);
  }

  if (res.status === 429) {
    throw new TransportError('rate-limit', data.error?.message ?? 'Rate limited (HTTP 429).', true, rawBody);
  }
  if (!res.ok || data.error) {
    const msg = data.error?.message ?? `HTTP ${res.status}`;
    const retryable = res.status >= 500;
    throw new TransportError('network', `Gemini API error: ${msg}`, retryable, rawBody);
  }

  const output = (data.candidates ?? [])
    .flatMap((c) => c.content?.parts ?? [])
    .map((p) => (p.text ?? '').trim())
    .filter(Boolean)
    .join('\n\n')
    .trim();

  if (!output) {
    throw new TransportError('malformed-response', 'Gemini response contained no text part.', true, rawBody);
  }
  return output;
};
