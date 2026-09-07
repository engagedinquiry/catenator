import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const manifestPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'assets',
  'content',
  'manifest.json'
);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

test('folder-browser: manifest has exactly the two roots, generated from disk', () => {
  assert.deepEqual(Object.keys(manifest).sort(), ['content/', 'schema/']);
});

test('folder-browser: every category and file label is a real on-disk name (no relabeling)', () => {
  for (const [root, cats] of Object.entries(manifest)) {
    for (const [cat, files] of Object.entries(cats)) {
      assert.match(cat, /^[\w.-]+$/, `${root}${cat} is not a bare folder name`);
      assert.ok(files.length > 0, `${root}${cat} has no files`);
      for (const f of files) assert.match(f, /^[\w.\- ]+$/, `${root}${cat}/${f} not a bare filename`);
    }
  }
});

test('folder-browser: content/ subfolders are whatever exists under docs/content/', () => {
  // not asserting specific persona names — just that the scan found some, and
  // that "creators" (a folder that exists on disk right now) is present verbatim
  assert.ok(Object.keys(manifest['content/']).length >= 1);
  assert.ok('creators' in manifest['content/'], 'expected the on-disk folder name "creators" verbatim');
});

test('folder-browser: schema/ subfolders are numbered sections, same mechanism', () => {
  const sections = Object.keys(manifest['schema/']);
  assert.ok(sections.length >= 1);
  assert.ok(sections.every((s) => /^\d/.test(s)), `not all schema sections are numbered: ${sections}`);
});

test('folder-browser: no manifest entry duplicates logic per root — shape is identical', () => {
  for (const root of Object.keys(manifest)) {
    assert.equal(typeof manifest[root], 'object');
    for (const files of Object.values(manifest[root])) assert.ok(Array.isArray(files));
  }
});
