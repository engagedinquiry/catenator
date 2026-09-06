/**
 * delivery.request-response — returns exactly the requested persona's output,
 * only when refracted, only when grounded/approved; topicId is implicit.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDelivery } from '../src/app/core/publish.ts';

const A = { personaId: 'a', personaName: 'First-time integrator', output: 'A text', provider: 'claude', model: 'm' };
const B = { personaId: 'b', personaName: 'Experienced developer', output: 'B text', provider: 'claude', model: 'm' };
const outputs = new Map([
  ['a', A],
  ['b', B]
]);
const baseCtx = {
  sessionTopicId: 'topic-abc123',
  refractedOutputs: outputs,
  groundingApproved: new Set(),
  ungroundedPersonaIds: new Set()
};

test('returns the exact persona requested, never another', () => {
  const res = resolveDelivery({ topicId: 'topic-abc123', personaId: 'b' }, baseCtx);
  assert.equal(res.ok, true);
  assert.equal(res.personaId, 'b');
  assert.equal(res.output, 'B text');
});

test('a persona not yet refracted returns a structured not-yet-refracted error', () => {
  const res = resolveDelivery({ topicId: 'topic-abc123', personaId: 'c' }, baseCtx);
  assert.equal(res.ok, false);
  assert.equal(res.error.type, 'not-yet-refracted');
});

test('a wrong topic id is rejected (id is supplied by the app, not the reader)', () => {
  const res = resolveDelivery({ topicId: 'something-else', personaId: 'a' }, baseCtx);
  assert.equal(res.ok, false);
  assert.equal(res.error.type, 'unknown-topic');
});

test('an ungrounded, unapproved persona cannot be delivered', () => {
  const ctx = { ...baseCtx, ungroundedPersonaIds: new Set(['a']) };
  const res = resolveDelivery({ topicId: 'topic-abc123', personaId: 'a' }, ctx);
  assert.equal(res.ok, false);
  assert.equal(res.error.type, 'ungrounded-claim');
});

test('once the verifier approves, the ungrounded persona delivers', () => {
  const ctx = {
    ...baseCtx,
    ungroundedPersonaIds: new Set(['a']),
    groundingApproved: new Set(['a'])
  };
  const res = resolveDelivery({ topicId: 'topic-abc123', personaId: 'a' }, ctx);
  assert.equal(res.ok, true);
  assert.equal(res.personaId, 'a');
});
