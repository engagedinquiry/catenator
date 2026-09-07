import { test } from 'node:test';
import assert from 'node:assert/strict';
import { internalRouteForHref, topicIdForFilename } from '../src/app/core/content-source.ts';
import { renderMarkdown } from '../src/app/core/markdown.ts';

// End-to-end: the README link text -> renderMarkdown -> <a href> -> the value
// HomePage.onClick actually reads. This is the path that was broken: the
// renderer used to rewrite every bare relative href to "#".
function hrefsFrom(md) {
  const out = {};
  for (const m of renderMarkdown(md).matchAll(/<a href="([^"]*)"[^>]*>([^<]*)<\/a>/g)) {
    out[m[2]] = m[1];
  }
  return out;
}

test('navigation: renderMarkdown preserves README persona-link hrefs (was rewritten to "#")', () => {
  const md = [
    '## Creators',
    '- [Start here](creators/README.md)',
    '- [The design document](creators/design-document.md)',
    '',
    '## Which one is you?',
    '- Start with [Engineers](#engineers).',
    '- [CC BY 4.0](LICENSE-CC-BY.md)',
    '- [Amazon](https://example.com/x)'
  ].join('\n');
  const h = hrefsFrom(md);
  assert.equal(h['Start here'], 'creators/README.md');
  assert.equal(h['The design document'], 'creators/design-document.md');
  assert.equal(h['Engineers'], '#engineers');
  assert.equal(h['CC BY 4.0'], 'LICENSE-CC-BY.md');
  assert.equal(h['Amazon'], 'https://example.com/x');
});

test('navigation: every rendered README href resolves to a route or is external', () => {
  // the real hrefs a folder link produces must each hand internalRouteForHref
  // something it can turn into a route
  for (const href of ['creators/README.md', 'engineers/refraction.md', 'tech-writers/governing-document.md']) {
    const r = internalRouteForHref(href);
    assert.ok(Array.isArray(r) && r.length >= 1, `${href} -> ${JSON.stringify(r)}`);
  }
});

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
