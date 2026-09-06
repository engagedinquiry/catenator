/**
 * byok-compiler.contract — retry once, structured errors, no silent empty
 * success, model-agnostic transport, and prompt guardrails.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSystemPrompt,
  buildPrompt,
  refractOnce,
  TransportError
} from '../src/app/core/refraction.ts';
import { MAX_PERSONAS } from '../src/app/model/models.ts';

const req = {
  apiKey: 'k',
  provider: 'claude',
  model: 'claude-sonnet-5',
  topicText: 'Rate limiting returns a 429 with an X-RateLimit-Reset header.',
  sources: [{ title: 'RL', reference: 'ADR-014', description: 'Sliding window.' }],
  persona: { id: 'p1', name: 'First-time integrator', summary: 'New to it', dimensions: ['Content'] }
};

test('system prompt forbids invention and external-material references', () => {
  const sys = buildSystemPrompt().toLowerCase();
  assert.ok(sys.includes('never introduce a fact'));
  assert.ok(sys.includes('not specified here'));
  assert.ok(sys.includes('do not add extra sections'));
});

test('user prompt names the topic text as the only source of facts', () => {
  const p = buildPrompt(req);
  assert.ok(p.includes('the only source of facts'));
  assert.ok(p.includes('First-time integrator'));
});

test('a successful call returns the model text', async () => {
  const outcome = await refractOnce(req, async () => 'refracted body');
  assert.equal(outcome.ok, true);
  assert.equal(outcome.result.output, 'refracted body');
  assert.equal(outcome.result.personaId, 'p1');
});

test('an empty model response is treated as malformed, not a success', async () => {
  const outcome = await refractOnce(req, async () => '   ');
  assert.equal(outcome.ok, false);
  assert.equal(outcome.error.type, 'malformed-response');
});

test('a retryable failure is retried exactly once, then returns errorOutput', async () => {
  let calls = 0;
  const outcome = await refractOnce(req, async () => {
    calls++;
    throw new TransportError('rate-limit', 'slow down', true);
  });
  assert.equal(calls, 2);
  assert.equal(outcome.ok, false);
  assert.equal(outcome.error.type, 'rate-limit');
  assert.equal(outcome.error.retryable, true);
});

test('a retry that succeeds yields a result', async () => {
  let calls = 0;
  const outcome = await refractOnce(req, async () => {
    calls++;
    if (calls === 1) throw new TransportError('network', 'blip', true);
    return 'second try body';
  });
  assert.equal(calls, 2);
  assert.equal(outcome.ok, true);
  assert.equal(outcome.result.output, 'second try body');
});

test('a non-retryable failure is not retried', async () => {
  let calls = 0;
  const outcome = await refractOnce(req, async () => {
    calls++;
    throw new TransportError('network', 'bad key', false);
  });
  assert.equal(calls, 1);
  assert.equal(outcome.ok, false);
});

test('model-agnostic: the same request works through any transport shape', async () => {
  const claudeish = async (r, s, u) => `claude:${u.length}`;
  const geminiish = async (r, s, u) => `gemini:${u.length}`;
  const a = await refractOnce({ ...req, provider: 'claude' }, claudeish);
  const b = await refractOnce({ ...req, provider: 'gemini' }, geminiish);
  assert.equal(a.ok && b.ok, true);
  assert.ok(a.result.output.startsWith('claude:'));
  assert.ok(b.result.output.startsWith('gemini:'));
});

test('MAX_PERSONAS is 2 (system.yaml hard cap)', () => {
  assert.equal(MAX_PERSONAS, 2);
});
