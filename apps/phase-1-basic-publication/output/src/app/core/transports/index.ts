/**
 * byok-compiler.contract.model-agnostic: one transport interface, one output
 * shape, regardless of Claude / Gemini / etc. The compiler core (refraction.ts)
 * imports this interface only — never a concrete vendor.
 */
export interface RefractionTransport {
  /** provider id, matches build-config.yaml → aiProvider.supported (lowercased). */
  readonly id: string;
  /**
   * Send one prompt, return the model's text. Throw on any failure — the caller
   * (refraction.ts) classifies and retries per call-failure-behavior.
   */
  complete(prompt: string, apiKey: string, model: string): Promise<string>;
}

import { AnthropicTransport } from './anthropic';
import { GeminiTransport } from './gemini';

const TRANSPORTS: Record<string, RefractionTransport> = {
  claude: new AnthropicTransport(),
  gemini: new GeminiTransport()
};

export function transportFor(provider: string): RefractionTransport | undefined {
  return TRANSPORTS[provider.toLowerCase()];
}

export function defaultModelFor(provider: string): string {
  switch (provider.toLowerCase()) {
    case 'claude':
      return 'claude-sonnet-4-20250514';
    case 'gemini':
      return 'gemini-2.5-flash';
    default:
      return '';
  }
}

export const SUPPORTED_PROVIDERS = Object.keys(TRANSPORTS);
