/**
 * Branding — the product name is Catenator, read from one place, with no prior
 * name ("Syntaxia" / "Syntaxia Studio") left anywhere in the source.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

import { BRAND, PRIOR_NAMES } from '../src/app/brand/brand.ts';

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = join(here, '../src');

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (['.ts', '.html', '.css'].includes(extname(e.name))) out.push(p);
  }
  return out;
}

test('product name is Catenator', () => {
  assert.equal(BRAND.productName, 'Catenator');
});

test('no prior product name appears anywhere in src/', () => {
  const offenders = [];
  for (const file of walk(srcRoot)) {
    const text = readFileSync(file, 'utf8');
    for (const name of PRIOR_NAMES) {
      // brand.ts legitimately lists the prior names in PRIOR_NAMES itself.
      if (file.endsWith('brand.ts')) continue;
      if (new RegExp(name, 'i').test(text)) offenders.push(`${file} :: ${name}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test('the product name literal lives in exactly one source file', () => {
  const hits = walk(srcRoot).filter((f) => !f.endsWith('brand.ts') && /['"`]Catenator['"`]/.test(readFileSync(f, 'utf8')));
  assert.deepEqual(hits, []);
});
