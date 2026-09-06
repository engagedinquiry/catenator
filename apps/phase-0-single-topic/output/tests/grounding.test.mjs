/**
 * check.grounding — a specific claim absent from topic/sources is flagged;
 * absent facts are reported as absent, not filled in.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkGrounding, extractClaims } from '../src/app/core/grounding.ts';

const topic =
  'The API responds with a 429 status and an X-RateLimit-Reset header telling the caller how many seconds to wait.';
const sources = [{ title: 'Rate limiting', reference: 'ADR-014', description: 'Sliding window limiter.' }];

test('extractClaims picks up numbers, header names, and ALL-CAPS tokens', () => {
  const claims = extractClaims('Wait for the X-RateLimit-Reset value; a 429 from the API means slow down.');
  assert.ok(claims.includes('X-RateLimit-Reset'));
  assert.ok(claims.includes('429'));
  assert.ok(claims.includes('API'));
});

test('a grounded output flags nothing', () => {
  const r = {
    personaId: 'p1',
    personaName: 'Reader',
    output: 'When you get a 429, read X-RateLimit-Reset and wait. It is defined in ADR-014.',
    provider: 'claude',
    model: 'm'
  };
  const report = checkGrounding(r, topic, sources);
  assert.equal(report.ungrounded.length, 0);
});

test('an invented specific value is flagged as not traced', () => {
  const r = {
    personaId: 'p1',
    personaName: 'Reader',
    output: 'The limit is 100 requests per minute and resets after 3600 seconds.',
    provider: 'claude',
    model: 'm'
  };
  const report = checkGrounding(r, topic, sources);
  const flagged = report.ungrounded.map((c) => c.text);
  assert.ok(flagged.includes('100'));
  assert.ok(flagged.includes('3600'));
});
