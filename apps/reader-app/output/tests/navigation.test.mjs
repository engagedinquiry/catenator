import { test } from 'node:test';
import assert from 'node:assert/strict';
import { internalRouteForHref, topicIdForFilename } from '../src/app/core/content-source.ts';

test('navigation: README folder link -> internal persona route (mustNever: no dead links)', () => {
  assert.deepEqual(internalRouteForHref('creators/README.md'), ['creators']);
  assert.deepEqual(internalRouteForHref('engineers/governing-document.md'), ['engineers', 'governing-document']);
  assert.deepEqual(internalRouteForHref('creators/design-document.md'), ['creators', 'governing-document']);
  assert.deepEqual(internalRouteForHref('governing-docs/schemas-and-specifications.md'), [
    'governing-docs',
    'schemas-and-specifications'
  ]);
});

test('navigation: "#personaId" anchor from the "which one is you?" list is internal too', () => {
  assert.deepEqual(internalRouteForHref('#creators'), ['creators']);
  assert.deepEqual(internalRouteForHref('#knowledge-teams'), ['knowledge-teams']);
});

test('navigation: non-persona links are left alone', () => {
  assert.equal(internalRouteForHref('LICENSE-CC-BY.md'), null);
  assert.equal(internalRouteForHref('https://example.com'), null);
  assert.equal(internalRouteForHref('#license'), null);
});

test('navigation: a persona folder link to an unmapped file still routes to the persona', () => {
  assert.deepEqual(internalRouteForHref('creators/nonexistent.md'), ['creators']);
});

test('navigation: topicIdForFilename reverse lookup respects per-persona filenames', () => {
  assert.equal(topicIdForFilename('creators', 'design-document.md'), 'governing-document');
  assert.equal(topicIdForFilename('engineers', 'design-document.md'), null);
  assert.equal(topicIdForFilename('engineers', 'governing-document.md'), 'governing-document');
});
