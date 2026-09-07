import { HttpError, MalformedResponseError } from './errors';
import type { RefractionTransport } from './index';

export { HttpError, MalformedResponseError };

/**
 * Claude transport for byok-compiler.contract. The compiler core never imports
 * this file directly (model-agnostic) — it is selected at call time by provider.
 */
export class AnthropicTransport implements RefractionTransport {
  readonly id = 'claude';

  async complete(prompt: string, apiKey: string, model: string): Promise<string> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model,
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) {
      const body = await res.text();
      throw new HttpError(res.status, body);
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
  const content = (data as { content?: unknown }).content;
  if (!Array.isArray(content)) return null;
  const first = content.find(
    (b): b is { type: string; text: string } =>
      typeof b === 'object' && b !== null && (b as { type?: unknown }).type === 'text'
  );
  return first ? first.text : null;
}

