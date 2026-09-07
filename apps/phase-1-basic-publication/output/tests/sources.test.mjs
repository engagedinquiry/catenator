import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveSourcesForTopic, danglingOverrideIds } from '../src/app/core/sources.ts';

const ALL = [
  { id: 's1', title: 'One', reference: '', description: '' },
  { id: 's2', title: 'Two', reference: '', description: '' },
  { id: 's3', title: 'Three', reference: '', description: '' }
];

test('default-is-all-sources: no override => every publication source', () => {
  const r = resolveSourcesForTopic({ sourceOverride: null }, ALL);
  assert.deepEqual(r.map((s) => s.id), ['s1', 's2', 's3']);
});

test('override replaces the default entirely for that topic', () => {
  const r = resolveSourcesForTopic({ sourceOverride: ['s3', 's1'] }, ALL);
  assert.deepEqual(r.map((s) => s.id).sort(), ['s1', 's3']);
});

test('override-references-real-sources-only: a bad id is not resolved, and is reported separately', () => {
  const topic = { sourceOverride: ['s1', 'ghost'] };
  assert.deepEqual(resolveSourcesForTopic(topic, ALL).map((s) => s.id), ['s1']);
  assert.deepEqual(danglingOverrideIds(topic, ALL), ['ghost']);
});

test("mustNever: one topic's override does not affect another topic", () => {
  const a = { sourceOverride: ['s1'] };
  const b = { sourceOverride: null };
  // resolving a does not mutate ALL or b
  resolveSourcesForTopic(a, ALL);
  assert.deepEqual(resolveSourcesForTopic(b, ALL).map((s) => s.id), ['s1', 's2', 's3']);
  assert.equal(ALL.length, 3);
});

test('an empty override list means "no sources", not "all sources"', () => {
  assert.deepEqual(resolveSourcesForTopic({ sourceOverride: [] }, ALL), []);
});
