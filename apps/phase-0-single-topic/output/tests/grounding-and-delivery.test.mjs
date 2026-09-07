import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkGrounding, extractClaims } from '../src/app/core/grounding.ts';
import { deliver } from '../src/app/core/delivery.ts';

const topic =
  'When a client exceeds its quota the API responds with a 429 status and an X-RateLimit-Reset header telling the caller how many seconds to wait.';
const sources = [
  { title: 'Understanding rate limiting', reference: 'ADR-014', description: 'Sliding window limiter; 429 status; X-RateLimit-Reset header.' }
];

test('check.grounding: a grounded output passes', () => {
  const out = 'When you exceed the quota you get a 429 and the X-RateLimit-Reset header tells you how long to wait.';
  assert.equal(checkGrounding(out, topic, sources).grounded, true);
});

test('check.grounding: an invented specific claim fails (mustNever: ungrounded specific claim)', () => {
  const out = 'You may retry after 30 seconds, and the limit is 5000 requests per hour.';
  const r = checkGrounding(out, topic, sources);
  assert.equal(r.grounded, false);
  assert.ok(r.ungrounded.includes('30') || r.ungrounded.includes('5000'));
});

test('check.grounding micro.missing-fact-disclosure: stating a fact as absent is not "ungrounded"', () => {
  const out = 'The topic does not specify the exact per-minute quota, so that number is not stated here.';
  assert.equal(checkGrounding(out, topic, sources).grounded, true);
});

test('extractClaims pulls numbers, header names, code spans', () => {
  const c = extractClaims('Returns `429` with the X-RateLimit-Reset header after 60 seconds.');
  assert.ok(c.includes('429'));
  assert.ok(c.includes('X-RateLimit-Reset'));
  assert.ok(c.includes('60'));
});

// delivery.request-response
const groundedText = 'You get a 429 and read X-RateLimit-Reset to know how long to wait.';
const ungroundedText = 'Wait 45 seconds, the cap is 200 per second.';

test('delivery: exact-persona-match — returns the requested persona only', () => {
  const map = new Map([['persona-0', groundedText], ['persona-1', 'other reader output only']]);
  const r = deliver({ topicId: 't', personaId: 'persona-0' }, map, topic, sources);
  assert.equal(r.ok, true);
  assert.equal(r.text, groundedText);
});

test('delivery: not-yet-refracted for a persona with no output', () => {
  const r = deliver({ topicId: 't', personaId: 'persona-1' }, new Map(), topic, sources);
  assert.equal(r.ok, false);
  assert.equal(r.error.type, 'not-yet-refracted');
});

test('delivery.grounding-gate: an ungrounded output is NOT served — {type: ungrounded-claim}', () => {
  const map = new Map([['persona-0', ungroundedText]]);
  const r = deliver({ topicId: 't', personaId: 'persona-0' }, map, topic, sources);
  assert.equal(r.ok, false);
  assert.equal(r.error.type, 'ungrounded-claim');
});

test('delivery.grounding-gate: runs every request (catches drift), not once at Refract', () => {
  const map = new Map([['persona-0', groundedText]]);
  assert.equal(deliver({ topicId: 't', personaId: 'persona-0' }, map, topic, sources).ok, true);
  map.set('persona-0', ungroundedText); // output "drifts"
  assert.equal(deliver({ topicId: 't', personaId: 'persona-0' }, map, topic, sources).ok, false);
});
