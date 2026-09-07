import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPrompt, refractOnce } from '../src/app/core/refraction.ts';
import { refractPublication } from '../src/app/core/publication-refract.ts';
import { HttpError } from '../src/app/core/transports/errors.ts';
import { refractionKey } from '../src/app/core/models.ts';

const persona = { name: 'Dev', summary: 'wants specifics', dimensions: ['Content', 'Trust'] };

// ---- buildPrompt (same grounding contract as phase-0) ----------------------
test('buildPrompt forbids inventing values and out-of-scope material', () => {
  const p = buildPrompt({ topicText: 'A topic about limits.', sources: [], persona });
  assert.match(p, /Use ONLY facts stated/i);
  assert.match(p, /Never invent a value/i);
  assert.match(p, /never imply the existence of any documentation/i);
  assert.match(p, /No extra sections/i);
  assert.match(p, /Dev/);
  assert.match(p, /Content, Trust/);
});

// ---- refractOnce: retry-once then structured error ------------------------
test('refractOnce retries exactly once, then returns a structured error', async () => {
  let calls = 0;
  const transport = {
    id: 'fake',
    async complete() {
      calls += 1;
      throw new HttpError(500, 'boom');
    }
  };
  const r = await refractOnce(transport, 'k', 'm', { topicText: 't', sources: [], persona });
  assert.equal(calls, 2, 'one call + one automatic retry');
  assert.equal(r.ok, false);
  assert.equal(r.error.type, 'network');
});

test('refractOnce maps HTTP 429 to rate-limit', async () => {
  const transport = { id: 'f', async complete() { throw new HttpError(429, 'slow down'); } };
  const r = await refractOnce(transport, 'k', 'm', { topicText: 't', sources: [], persona });
  assert.equal(r.error.type, 'rate-limit');
});

test('an empty model body is malformed-response, not an empty success', async () => {
  const transport = { id: 'f', async complete() { return '   '; } };
  const r = await refractOnce(transport, 'k', 'm', { topicText: 't', sources: [], persona });
  assert.equal(r.ok, false);
  assert.equal(r.error.type, 'malformed-response');
});

// ---- refractPublication: one action, many calls -------------------------
function pub(topics, personas) {
  return {
    meta: { displayName: 'P' },
    topics,
    sources: [{ id: 's-a', title: 'A', reference: 'ADR-1', description: 'The API returns 429 on limit.' }],
    personas,
    variables: []
  };
}
function t(id, content, over = null, children = []) {
  return { id, name: id, metadata: {}, content, sourceOverride: over, children };
}

test('one-action-many-calls: a single call refracts every (topic × persona) pair', async () => {
  const calls = [];
  const transport = {
    id: 'fake',
    async complete(prompt) {
      calls.push(prompt);
      return 'The API returns 429 on limit.'; // fully grounded in the source
    }
  };
  const publication = pub(
    [t('a', 'The API returns 429 on limit.', null, [t('b', 'The API returns 429 on limit.')]), t('c', 'The API returns 429 on limit.')],
    [
      { id: 'persona-0', name: 'P0', summary: '', dimensions: [] },
      { id: 'persona-1', name: 'P1', summary: '', dimensions: [] }
    ]
  );
  const res = await refractPublication(publication, transport, 'key', 'model');
  assert.equal(res.ran, true);
  assert.equal(calls.length, 6, '3 topics × 2 personas');
  assert.equal(res.cells.size, 6);
  assert.ok(res.cells.get(refractionKey('b', 'persona-1')).ok);
});

test('resolved-sources-per-topic: an override narrows what a topic call sees', async () => {
  const seen = {};
  const transport = {
    id: 'fake',
    async complete(prompt) {
      return 'ok';
    }
  };
  // topic 'x' overrides to [] (no sources); its call's prompt must show "(none provided)"
  const publication = {
    meta: { displayName: 'P' },
    topics: [t('x', 'content x', [])],
    sources: [{ id: 's-a', title: 'A', reference: 'r', description: 'd' }],
    personas: [{ id: 'persona-0', name: 'P0', summary: '', dimensions: [] }],
    variables: []
  };
  const spy = {
    id: 'fake',
    async complete(prompt) {
      seen.prompt = prompt;
      return 'content x';
    }
  };
  await refractPublication(publication, spy, 'k', 'm');
  assert.match(seen.prompt, /\(none provided\)/, 'empty override => no sources in the prompt');
});

test('same-failure-behavior-as-phase-0: one failing pair does not block the others', async () => {
  const transport = {
    id: 'fake',
    async complete(prompt) {
      if (prompt.includes('BREAK')) throw new HttpError(503, 'down');
      return 'The API returns 429 on limit.';
    }
  };
  const publication = pub(
    [t('good', 'The API returns 429 on limit.'), t('bad', 'BREAK content')],
    [{ id: 'persona-0', name: 'P0', summary: '', dimensions: [] }]
  );
  const res = await refractPublication(publication, transport, 'k', 'm');
  assert.equal(res.cells.get(refractionKey('good', 'persona-0')).ok, true);
  assert.equal(res.cells.get(refractionKey('bad', 'persona-0')).ok, false);
  assert.equal(res.cells.get(refractionKey('bad', 'persona-0')).error.type, 'network');
});

test('mustNever invent-a-value: an ungrounded model output is surfaced as an error, not kept as text', async () => {
  const transport = {
    id: 'fake',
    async complete() {
      // "9999" and X-Fake-Header appear in neither the topic nor its source
      return 'Wait 9999 seconds and read the X-Fake-Header value.';
    }
  };
  const publication = pub(
    [t('a', 'The API returns 429 on limit.')],
    [{ id: 'persona-0', name: 'P0', summary: '', dimensions: [] }]
  );
  const res = await refractPublication(publication, transport, 'k', 'm');
  const cell = res.cells.get(refractionKey('a', 'persona-0'));
  assert.equal(cell.ok, false);
  assert.equal(cell.error.type, 'ungrounded-claim');
  assert.equal(cell.text, undefined);
});

test('persona-exists gate: refractPublication does nothing when there are no personas', async () => {
  let called = 0;
  const transport = { id: 'f', async complete() { called += 1; return 'x'; } };
  const res = await refractPublication(pub([t('a', 'x')], []), transport, 'k', 'm');
  assert.equal(res.ran, false);
  assert.equal(called, 0);
  assert.equal(res.cells.size, 0);
});
