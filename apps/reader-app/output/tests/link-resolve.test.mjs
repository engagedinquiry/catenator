import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveRelativePath, classifyHref, toRouteUrl } from '../src/app/core/link-resolve.ts';

test('navigation.routing: relative-link-resolution is pure "./" and "../" folding', () => {
  // spec example: current file personas/tech-writers/README.md, link ../creators/design-document.md
  assert.deepEqual(
    resolveRelativePath(['personas', 'tech-writers'], '../creators/design-document.md'),
    ['personas', 'creators', 'design-document.md']
  );
  // sibling link inside a persona file
  assert.deepEqual(
    resolveRelativePath(['personas', '1-creators'], '3-refraction.md'),
    ['personas', '1-creators', '3-refraction.md']
  );
  // "./" no-op, extra "../" clamps at root
  assert.deepEqual(resolveRelativePath(['schema', '3-views'], './3.1-interface.md'), [
    'schema',
    '3-views',
    '3.1-interface.md'
  ]);
  assert.deepEqual(resolveRelativePath(['a'], '../../../x.md'), ['x.md']);
});

test('navigation.routing: link from the home README resolves against the content root', () => {
  // docs/README.md is at the content root -> base dir is []
  assert.deepEqual(resolveRelativePath([], 'personas/1-creators/2-design-document.md'), [
    'personas',
    '1-creators',
    '2-design-document.md'
  ]);
  // a stale link written for the old flat layout stays literal (no guessing)
  assert.deepEqual(resolveRelativePath([], 'creators/design-document.md'), ['creators', 'design-document.md']);
});

test('navigation.routing: classifyHref splits external / anchor / absolute / relative', () => {
  assert.equal(classifyHref('https://example.com'), 'external');
  assert.equal(classifyHref('mailto:x@y.z'), 'external');
  assert.equal(classifyHref('#creators'), 'anchor');
  assert.equal(classifyHref('/personas/1-creators'), 'absolute');
  assert.equal(classifyHref('../creators/x.md'), 'relative');
  assert.equal(classifyHref('x.md'), 'relative');
});

test('navigation.routing: toRouteUrl drops only the trailing extension, keeps order prefixes', () => {
  assert.equal(toRouteUrl(['personas', '1-creators', '2-design-document.md']), '/personas/1-creators/2-design-document');
  assert.equal(toRouteUrl(['schema', '0-catenator-standard.md']), '/schema/0-catenator-standard');
  assert.equal(toRouteUrl(['personas', '1-creators']), '/personas/1-creators');
  assert.equal(toRouteUrl([]), '/');
});
