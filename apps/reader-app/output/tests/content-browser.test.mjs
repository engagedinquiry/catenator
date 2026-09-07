import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { displayName, orderSort, urlSegmentFor, resolveNode } from '../src/app/core/content-tree.ts';

const manifest = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'content', 'manifest.json'),
    'utf8'
  )
);

test('content.browser: order prefix stripped for display, kept elsewhere', () => {
  assert.equal(displayName('2-descriptors'), 'descriptors');
  assert.equal(displayName('3.1-interface.md'), 'interface.md');
  assert.equal(displayName('README.md'), 'README.md');
  assert.equal(displayName('creators'), 'creators');
});

test('content.browser: numeric sort by order prefix (2 before 10, 3.1 before 3.2), unprefixed last', () => {
  const input = ['10-x', '2-a', '3.2-c', '3.1-b', 'zeta', 'alpha'];
  assert.deepEqual([...input].sort(orderSort), ['2-a', '3.1-b', '3.2-c', '10-x', 'alpha', 'zeta']);
});

test('content.browser: manifest is a recursive tree from disk, both roots configured', () => {
  assert.equal(manifest.home, 'README.md');
  const ids = manifest.roots.map((r) => r.id);
  assert.deepEqual(ids.sort(), ['personas', 'schema']);
  assert.equal(manifest.roots.find((r) => r.id === 'personas').navigationMode, 'dropdown');
  assert.equal(manifest.roots.find((r) => r.id === 'schema').navigationMode, 'tree');
});

test('content.browser: every tree node is {name,type}, folders recurse (no fixed depth)', () => {
  const check = (node) => {
    assert.ok(typeof node.name === 'string');
    assert.ok(node.type === 'file' || node.type === 'folder');
    if (node.type === 'folder') {
      assert.ok(Array.isArray(node.children));
      node.children.forEach(check);
    } else {
      assert.equal(node.children, undefined);
    }
  };
  manifest.roots.forEach((r) => check(r.tree));
});

test('content.browser: url segment strips the file extension, keeps order prefix', () => {
  assert.equal(urlSegmentFor({ name: '3.1-interface.md', type: 'file' }), '3.1-interface');
  assert.equal(urlSegmentFor({ name: 'refraction.md', type: 'file' }), 'refraction');
  assert.equal(urlSegmentFor({ name: '3-views', type: 'folder' }), '3-views');
});

test('content.browser: resolveNode matches a URL segment by stem, returns real path', () => {
  const tree = {
    name: 'schema',
    type: 'folder',
    children: [
      { name: '3-views', type: 'folder', children: [{ name: '3.1-interface.md', type: 'file' }] }
    ]
  };
  const hit = resolveNode(tree, ['3-views', '3.1-interface']);
  assert.equal(hit.node.type, 'file');
  assert.deepEqual(hit.realPath, ['3-views', '3.1-interface.md']);
  assert.equal(resolveNode(tree, ['3-views', 'nope']), null);
});

test('content.browser: schema/ subfolders carry order prefixes; personas/ do not', () => {
  const schema = manifest.roots.find((r) => r.id === 'schema').tree.children.map((c) => c.name);
  assert.ok(schema.some((n) => /^\d/.test(n)), `expected numbered sections: ${schema}`);
  const personas = manifest.roots.find((r) => r.id === 'personas').tree.children.map((c) => c.name);
  assert.ok(personas.every((n) => !/^\d/.test(n)), `persona folders should be plain: ${personas}`);
});
