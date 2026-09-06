import { RefractionTransport } from '../refraction';
import { anthropicTransport } from './anthropic';
import { geminiTransport } from './gemini';

/** Providers this build supports (build-config.yaml → aiProvider.supported). */
export const PROVIDERS = [
  { id: 'claude', label: 'Claude', defaultModel: 'claude-sonnet-5' },
  { id: 'gemini', label: 'Gemini', defaultModel: 'gemini-2.5-flash' }
] as const;

export type ProviderId = (typeof PROVIDERS)[number]['id'];

const TRANSPORTS: Record<ProviderId, RefractionTransport> = {
  claude: anthropicTransport,
  gemini: geminiTransport
};

export function transportFor(provider: string): RefractionTransport {
  const t = TRANSPORTS[provider as ProviderId];
  if (!t) throw new Error(`No transport registered for provider "${provider}".`);
  return t;
}

export function defaultModelFor(provider: string): string {
  return PROVIDERS.find((p) => p.id === provider)?.defaultModel ?? '';
}
