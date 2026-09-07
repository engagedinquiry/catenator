import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND, PRIOR_NAMES, pageTitle } from '../src/app/brand/brand.ts';

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === 'assets') continue;
      out.push(...walk(p));
    } else if (/\.(ts|html|css)$/.test(name)) out.push(p);
  }
  return out;
}

test('branding: name + tagline mirror build-config; dynamic title composes', () => {
  assert.equal(BRAND.productName, 'Catenator Reader');
  assert.equal(BRAND.tagline, 'Browse by persona, or view the schema');
  assert.equal(pageTitle(['Interface', 'views']), 'Interface — views — Catenator Reader');
  assert.equal(pageTitle([]), 'Catenator Reader');
});

test('branding: product name is a literal in exactly one file', () => {
  const hits = walk(srcDir).filter(
    (f) => !f.endsWith(join('brand', 'brand.ts')) && readFileSync(f, 'utf8').includes(BRAND.productName)
  );
  assert.deepEqual(hits, [], `hardcoded outside brand.ts: ${hits}`);
});

test('branding: no retired Catenator-family name in source', () => {
  for (const f of walk(srcDir)) {
    if (f.endsWith(join('brand', 'brand.ts'))) continue;
    const text = readFileSync(f, 'utf8');
    for (const prior of PRIOR_NAMES) assert.ok(!text.includes(prior), `${prior} in ${f}`);
  }
});

test('no-hardcoded-names: no persona/section folder literal in app code', () => {
  const banned = ['tech-writers', 'knowledge-teams', 'governing-docs', 'founding-statement', '3-views'];
  for (const f of walk(srcDir)) {
    const text = readFileSync(f, 'utf8');
    for (const b of banned) assert.ok(!text.includes(b), `hardcoded "${b}" in ${f}`);
  }
});

test('layout.shell.fixed-vertical-order: persona list is between the dropdown and the Schema docs button', () => {
  const nav = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'app', 'ui', 'nav-panel.ts'), 'utf8');
  const dropdown = nav.indexOf('class="reading-as"');
  const personaList = nav.indexOf('<app-persona-topics />');
  const schemaBtn = nav.indexOf('class="schema-btn"');
  const schemaTree = nav.indexOf('<app-schema-tree');
  assert.ok(dropdown > -1 && personaList > -1 && schemaBtn > -1 && schemaTree > -1);
  assert.ok(dropdown < personaList, 'dropdown must come before the persona list');
  assert.ok(personaList < schemaBtn, 'persona list must come BEFORE the Schema docs button');
  assert.ok(schemaBtn < schemaTree, 'schema tree must come after the Schema docs button');
});

test('one-breakpoint: 768 appears only in app.ts, and as the media query value', () => {
  const withBp = walk(srcDir).filter((f) => readFileSync(f, 'utf8').includes('768'));
  assert.deepEqual(
    withBp.map((f) => f.split(/[\\/]/).pop()),
    ['app.ts'],
    'the mobile breakpoint must live in exactly one place'
  );
});
