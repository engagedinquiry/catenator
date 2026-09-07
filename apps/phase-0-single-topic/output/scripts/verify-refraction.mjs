/**
 * Optional live check: run the real buildPrompt / refractOnce path against a
 * live provider with the two contrasting rate-limiting fixture personas and
 * report divergence. Never part of `npm test` — needs a real key.
 *
 *   ANTHROPIC_API_KEY=... npm run verify:refraction
 *   VERIFY_PROVIDER=gemini GEMINI_API_KEY=... npm run verify:refraction
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPrompt, refractOnce } from '../src/app/core/refraction.ts';
import { transportFor, defaultModelFor } from '../src/app/core/transports/index.ts';

const provider = (process.env.VERIFY_PROVIDER ?? 'claude').toLowerCase();
const key = process.env.ANTHROPIC_API_KEY ?? process.env.GEMINI_API_KEY ?? '';
if (!key) {
  console.error('Set ANTHROPIC_API_KEY or GEMINI_API_KEY.');
  process.exit(2);
}

const FIX = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'fixtures', 'rate-limiting');
const topicText = readFileSync(join(FIX, 'topic.md'), 'utf8').trim();
const sources = [
  {
    title: 'Understanding rate limiting',
    reference: 'API Gateway design decision, ADR-014',
    description:
      'Sliding window limiter. On limit exceeded: 429 status, X-RateLimit-Reset header.'
  }
];
const personas = [
  { name: 'First-time integrator', summary: 'Needs the concept explained first.', dimensions: ['Content', 'Context'] },
  { name: 'Experienced API developer', summary: 'Just needs this API\'s numbers and header name.', dimensions: ['Content', 'Trust'] }
];

const transport = transportFor(provider);
const model = defaultModelFor(provider);
for (const persona of personas) {
  console.log(`\n=== ${persona.name} (${persona.dimensions.join(', ')}) ===`);
  const r = await refractOnce(transport, key, model, { topicText, sources, persona });
  console.log(r.ok ? r.text : `ERROR ${r.error.type}: ${r.error.message}`);
}
console.log('\n(prompt length:', buildPrompt({ topicText, sources, persona: personas[0] }).length, 'chars)');
