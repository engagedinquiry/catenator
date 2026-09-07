import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deliver } from '../src/app/core/delivery.ts';

const stubFetch = (map) => async (url) => {
  if (url in map) return map[url];
  throw new Error('HTTP 404');
};

test('delivery: no persona chosen => no-persona-selected, never a guess (mustNever)', async () => {
  const res = await deliver({ topicId: 'start', personaId: null }, stubFetch({}));
  assert.equal(res.kind, 'no-persona-selected');
});

test('delivery: returns exactly the requested persona/topic file', async () => {
  const res = await deliver(
    { topicId: 'refraction', personaId: 'engineers' },
    stubFetch({ 'assets/content/engineers/refraction.md': '# Engineers refraction' })
  );
  assert.equal(res.kind, 'content');
  assert.equal(res.markdown, '# Engineers refraction');
});

test('delivery: null pair => not-available-for-persona with a worded message (errorOutput)', async () => {
  const res = await deliver({ topicId: 'mechanics', personaId: 'governing-docs' }, stubFetch({}));
  assert.equal(res.kind, 'not-available-for-persona');
  assert.match(res.message, /not covered/i);
});

test('delivery: listed file that fails to load => not-found, not silent', async () => {
  const res = await deliver({ topicId: 'refraction', personaId: 'creators' }, stubFetch({}));
  assert.equal(res.kind, 'not-found');
});

test('delivery: unknown topic => not-found', async () => {
  const res = await deliver({ topicId: 'nope', personaId: 'creators' }, stubFetch({}));
  assert.equal(res.kind, 'not-found');
});

test('delivery: topic persists across persona switch (content.source micro)', async () => {
  const fetch = stubFetch({
    'assets/content/creators/refraction.md': 'creators',
    'assets/content/engineers/refraction.md': 'engineers'
  });
  const a = await deliver({ topicId: 'refraction', personaId: 'creators' }, fetch);
  const b = await deliver({ topicId: 'refraction', personaId: 'engineers' }, fetch);
  assert.equal(a.markdown, 'creators');
  assert.equal(b.markdown, 'engineers');
});
