/**
 * Step 4 verification harness (byok-compiler.contract).
 *
 * Compiles the real compiler core (src/app/core/refraction.ts + model) and runs
 * it against a live provider with two contrasting personas over one fixed
 * topic, then reports whether the outputs diverge. This is the same
 * buildPrompt / refractOnce path the app's Step 4 uses.
 *
 *   ANTHROPIC_API_KEY=... node scripts/verify-refraction.mjs            # Claude
 *   VERIFY_PROVIDER=gemini GEMINI_API_KEY=... node scripts/verify-refraction.mjs
 */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('../tests/loader.mjs', pathToFileURL(import.meta.url));

const provider = process.env.VERIFY_PROVIDER || 'claude';
const apiKey =
  provider === 'gemini' ? process.env.GEMINI_API_KEY : process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error(`Set ${provider === 'gemini' ? 'GEMINI_API_KEY' : 'ANTHROPIC_API_KEY'} first.`);
  process.exit(1);
}

const { refractOnce, buildPrompt } = await import('../src/app/core/refraction.ts');
const { transportFor, defaultModelFor } = await import('../src/app/core/transports/index.ts');

const model = process.env.VERIFY_MODEL || defaultModelFor(provider);
const topicText = `Our API enforces rate limiting to keep the platform stable under load. Every
account gets a request quota per minute. When a client exceeds it, the API
responds with a 429 status and an X-RateLimit-Reset header telling the caller
exactly how many seconds to wait before trying again.`;
const sources = [
  {
    title: 'Understanding rate limiting',
    reference: 'API Gateway design decision, ADR-014',
    description: 'Sliding window limiter. On limit exceeded: 429 status, X-RateLimit-Reset header.'
  }
];
const personas = [
  {
    id: 'first-time-integrator',
    name: 'First-time integrator',
    summary: "Doesn't know what rate limiting is conceptually; needs the why before any code.",
    dimensions: ['Content', 'Context']
  },
  {
    id: 'experienced-api-developer',
    name: 'Experienced API developer',
    summary: 'Knows the concept; just wants this API’s exact numbers and header name.',
    dimensions: ['Content', 'Trust']
  }
];

const transport = transportFor(provider);
console.log(`--- prompt (persona 1) ---\n${buildPrompt({ topicText, sources, persona: personas[0] })}\n`);

const results = [];
for (const persona of personas) {
  const outcome = await refractOnce({ apiKey, provider, model, topicText, sources, persona }, transport);
  if (!outcome.ok) {
    console.error(`FAIL ${persona.name}:`, outcome.error);
    process.exit(1);
  }
  results.push(outcome.result);
  console.log(`--- output: ${outcome.result.personaName} (${outcome.result.provider} · ${outcome.result.model}) ---\n${outcome.result.output}\n`);
}

const [a, b] = results;
const wA = new Set(a.output.toLowerCase().split(/\W+/).filter(Boolean));
const wB = new Set(b.output.toLowerCase().split(/\W+/).filter(Boolean));
const overlap = Math.round(([...wA].filter((w) => wB.has(w)).length / new Set([...wA, ...wB]).size) * 100);
console.log('--- divergence ---');
console.log('identical  :', a.output.trim() === b.output.trim());
console.log('lengths    :', a.output.length, 'vs', b.output.length);
console.log('lex overlap:', overlap + '%');
