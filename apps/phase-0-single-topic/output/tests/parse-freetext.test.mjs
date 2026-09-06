/**
 * input-mode.dual — parser parity against fixtures/rate-limiting/.
 *
 * micro.parity-check-required: sources-freetext-markdown.md and
 * personas-freetext.md must parse into exactly the values recorded in
 * expected-parsed.yaml (transcribed here as the EXPECTED constants).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { parseSource, parseSources, parsePersonas, cleanValue } from '../src/app/core/parse-freetext.ts';

const here = dirname(fileURLToPath(import.meta.url));
const fx = (name) => readFileSync(join(here, '../../fixtures/rate-limiting/', name), 'utf8');

// --- transcribed from fixtures/rate-limiting/expected-parsed.yaml -------------
const EXPECTED_SOURCE = {
  title: 'Understanding rate limiting',
  reference: 'API Gateway design decision, ADR-014',
  description:
    'Sliding window limiter. On limit exceeded: 429 status, X-RateLimit-Reset header. Explains what rate limiting is and why the API responds with a wait time instead of just failing, so integrators understand the reasoning behind the 429 behavior rather than just the mechanics of it.'
};
const EXPECTED_PERSONAS = [
  {
    name: 'First-time integrator',
    summary:
      "Doesn't know what rate limiting is conceptually. Needs the concept explained — why it exists, what a 429 means, why the header matters — before seeing any code.",
    dimensions: ['Content', 'Context']
  },
  {
    name: 'Experienced API developer',
    summary:
      'Already understands rate limiting as a concept from other APIs. Just needs this API\'s specific numbers and header name — skip the "why," give the exact behavior.',
    dimensions: ['Content', 'Trust']
  }
];

test('sources free-text markdown parses to the expected single record', () => {
  const parsed = parseSource(fx('sources-freetext-markdown.md'));
  assert.deepEqual(parsed, EXPECTED_SOURCE);
});

test('parseSources returns exactly one entry (record is not split)', () => {
  const list = parseSources(fx('sources-freetext-markdown.md'));
  assert.equal(list.length, 1);
});

test('personas free-text markdown parses to the expected two personas', () => {
  const parsed = parsePersonas(fx('personas-freetext.md')).map((p) => ({
    name: p.name,
    summary: p.summary,
    dimensions: p.dimensions
  }));
  assert.deepEqual(parsed, EXPECTED_PERSONAS);
});

test('dimensions come out in canonical order regardless of source order', () => {
  // fixture writes "Context, Content" — expected canonical is ["Content","Context"]
  const p = parsePersonas('## R\n\nSummary.\n\nTrust, Surface, Content')[0];
  assert.deepEqual(p.dimensions, ['Surface', 'Content', 'Trust']);
});

test('parse-only-what-is-stated: an unmentioned dimension stays unselected', () => {
  const p = parsePersonas('## R\n\nCares about clarity and speed.\n\nContent')[0];
  assert.deepEqual(p.dimensions, ['Content']);
});

test('parse-only-what-is-stated: a missing source section stays blank, not inferred', () => {
  const s = parseSource('## Title\n\nJust a title here.');
  assert.equal(s.title, 'Just a title here.');
  assert.equal(s.reference, '');
  assert.equal(s.description, '');
});

test('clean-value-extraction: heading marks and surrounding quotes are stripped', () => {
  assert.equal(cleanValue('## Heading text'), 'Heading text');
  assert.equal(cleanValue('"quoted value"'), 'quoted value');
  assert.equal(cleanValue('- bullet value'), 'bullet value');
  const s = parseSource('## Title\n\n"Understanding rate limiting"');
  assert.equal(s.title, 'Understanding rate limiting');
});

test('deprecated "Label:" prefix style is NOT parsed as fields', () => {
  const s = parseSource('Title: Something\nSource: ADR-1\nDescription: text');
  assert.deepEqual(s, { title: '', reference: '', description: '' });
});

test('personas parser caps at MAX_PERSONAS (2)', () => {
  const many = ['## A', 'sa', '', '## B', 'sb', '', '## C', 'sc'].join('\n');
  assert.equal(parsePersonas(many).length, 2);
});
