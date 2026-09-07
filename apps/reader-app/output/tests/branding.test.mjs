import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND, BRAND_LINE, PRIOR_NAMES } from '../src/app/brand/brand.ts';

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === 'assets') continue;
      out.push(...walk(p));
    } else if (/\.(ts|html|css)$/.test(name)) {
      out.push(p);
    }
  }
  return out;
}

test('branding: name + tagline mirror build-config', () => {
  assert.equal(BRAND.productName, 'Catenator Reader');
  assert.equal(BRAND.tagline, 'Browse by persona, or view the schema');
  assert.equal(BRAND_LINE, 'Catenator Reader · Browse by persona, or view the schema');
});

test('branding: product name is a literal in exactly one file (single-source-of-truth)', () => {
  const hits = walk(srcDir).filter(
    (f) => !f.endsWith(join('brand', 'brand.ts')) && readFileSync(f, 'utf8').includes(BRAND.productName)
  );
  assert.deepEqual(hits, [], `product name hardcoded outside brand.ts: ${hits}`);
});

test('branding: no retired Catenator-family name in source', () => {
  for (const f of walk(srcDir)) {
    if (f.endsWith(join('brand', 'brand.ts'))) continue;
    const text = readFileSync(f, 'utf8');
    for (const prior of PRIOR_NAMES) assert.ok(!text.includes(prior), `${prior} in ${f}`);
  }
});

test('no-routing: nothing imports @angular/router (view.state mustNever)', () => {
  for (const f of walk(srcDir)) {
    if (!f.endsWith('.ts')) continue;
    assert.ok(!readFileSync(f, 'utf8').includes('@angular/router'), `@angular/router imported in ${f}`);
  }
});

test('no-hardcoded-names: no persona/section/topic list literal in app code', () => {
  // the only place folder names may appear is a test or the manifest (generated).
  const banned = ['tech-writers', 'knowledge-teams', 'governing-docs', 'founding-statement'];
  for (const f of walk(srcDir)) {
    const text = readFileSync(f, 'utf8');
    for (const b of banned) assert.ok(!text.includes(b), `hardcoded folder name "${b}" in ${f}`);
  }
});
