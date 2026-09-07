import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';
import { PRIOR_NAMES, BRAND } from '../src/app/brand/brand.ts';
import { GUIDE_BLOCKS } from '../src/app/core/guide-content.ts';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, '..', 'src');
const rel = (f) => relative(SRC, f).split(/[\\/]/).join('/');

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(ts|html|css)$/.test(name)) out.push(p);
  }
  return out;
}
const FILES = walk(SRC);

test('branding.single-source-of-truth: the product name literal is in exactly one file (brand.ts)', () => {
  const needle = BRAND.productName;
  const hits = FILES.filter((f) => readFileSync(f, 'utf8').includes(needle)).map((f) => rel(f));
  assert.deepEqual(hits, ['app/brand/brand.ts'], `product name literal leaked into: ${hits.join(', ')}`);
});

test('branding.scan-for-prior-names: no retired product name anywhere in src (outside brand.ts PRIOR_NAMES)', () => {
  const offenders = [];
  for (const f of FILES) {
    if (rel(f) === 'app/brand/brand.ts') continue;
    const text = readFileSync(f, 'utf8');
    for (const prior of PRIOR_NAMES) if (text.includes(prior)) offenders.push(`${rel(f)} :: ${prior}`);
  }
  assert.deepEqual(offenders, []);
});

test('system.yaml mustNever: no modal dialog anywhere in the built app', () => {
  const offenders = [];
  for (const f of FILES) {
    const text = readFileSync(f, 'utf8');
    if (/<dialog[\s>]/i.test(text) || /role=["']dialog["']/i.test(text) || /\bshowModal\s*\(/.test(text) || /MatDialog|CdkDialog|NgbModal/.test(text)) {
      offenders.push(rel(f));
    }
  }
  assert.deepEqual(offenders, [], `dialog markers found in: ${offenders.join(', ')}`);
});

test('layout.three-panel.accordion-sections-fixed: exactly the five sections, and no Shared Blocks', () => {
  const nav = readFileSync(join(SRC, 'app/ui/accordion-nav.ts'), 'utf8');
  for (const section of ['Publication', 'Topics', 'Variables', 'Sources', 'Personas']) {
    assert.match(nav, new RegExp(`>\\s*${section}`), `missing accordion section: ${section}`);
  }
  assert.doesNotMatch(nav, />\s*Shared Blocks/i, 'Shared Blocks must not be a rendered section in this phase');
  // count the section headers (buttons with class "hd")
  const headerCount = (nav.match(/class="hd"/g) || []).length;
  assert.equal(headerCount, 5, 'exactly five accordion section headers');
});

test('guide.static-per-selection.five-fixed-blocks: exactly five guide blocks, one per selection type', () => {
  assert.deepEqual(Object.keys(GUIDE_BLOCKS).sort(), ['personas', 'publication', 'sources', 'topic', 'variables']);
});

test('style.visual-theme: no icon library / runtime dependency on a reference app', () => {
  const pkg = JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf8'));
  const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
  for (const d of deps) {
    assert.doesNotMatch(d, /icon|feather|lucide|fontawesome|heroicons/i, `unexpected icon dependency: ${d}`);
  }
  for (const f of FILES) {
    assert.doesNotMatch(readFileSync(f, 'utf8'), /syntaxia-studio|eisyntaxia_repos/i, `reference-app path referenced in ${rel(f)}`);
  }
});
