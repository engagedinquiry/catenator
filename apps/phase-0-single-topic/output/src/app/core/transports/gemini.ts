import { HttpError, MalformedResponseError } from './errors';
import type { RefractionTransport } from './index';

/**
 * Gemini transport for byok-compiler.contract — the same interface and text
 * output as the Claude transport (model-agnostic). Chosen at call time by
 * provider; never imported by the compiler core.
 */
export class GeminiTransport implements RefractionTransport {
  readonly id = 'gemini';

  async complete(prompt: string, apiKey: string, model: string): Promise<string> {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent` +
      `?key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!res.ok) {
      throw new HttpError(res.status, await res.text());
    }

    const data: unknown = await res.json();
    const text = readFirstText(data);
    if (text === null) {
      throw new MalformedResponseError(JSON.stringify(data));
    }
    return text;
  }
}

function readFirstText(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return null;
  const candidates = (data as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const parts = (candidates[0] as { content?: { parts?: unknown } })?.content?.parts;
  if (!Array.isArray(parts)) return null;
  const withText = parts.find(
    (p): p is { text: string } => typeof p === 'object' && p !== null && typeof (p as { text?: unknown }).text === 'string'
  );
  return withText ? withText.text : null;
}
