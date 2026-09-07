import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPrompt, refractOnce } from '../src/app/core/refraction.ts';
import { BRAND, PRIOR_NAMES } from '../src/app/brand/brand.ts';

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(ts|html|css)$/.test(name)) out.push(p);
  }
  return out;
}

const input = {
  topicText: 'The API returns 429 with X-RateLimit-Reset.',
  sources: [{ title: 'T', reference: 'ADR-014', description: 'D' }],
  persona: { name: 'First-time integrator', summary: 'Needs the concept', dimensions: ['Content', 'Context'] }
};

test('byok-compiler: buildPrompt carries the no-unrequested-scope + no-external-material instructions', () => {
  const p = buildPrompt(input);
  assert.ok(/ONLY facts stated in the TOPIC or SOURCES/.test(p));
  assert.ok(/never imply the existence of any documentation or material beyond/i.test(p));
  assert.ok(/No extra sections/i.test(p));
  assert.ok(p.includes('First-time integrator') && p.includes('Content, Context'));
});

test('byok-compiler: model-agnostic — refractOnce takes any transport with complete()', async () => {
  let calls = 0;
  const fakeTransport = { id: 'fake', async complete() { calls++; return 'A short grounded answer.'; } };
  const r = await refractOnce(fakeTransport, 'k', 'm', input);
  assert.equal(r.ok, true);
  assert.equal(calls, 1);
});

test('byok-compiler.call-failure-behavior: automatic single retry, then structured error, never empty success', async () => {
  let calls = 0;
  const flaky = { id: 'x', async complete() { calls++; throw new Error('network down'); } };
  const r = await refractOnce(flaky, 'k', 'm', input);
  assert.equal(calls, 2, 'exactly one automatic retry');
  assert.equal(r.ok, false);
  assert.equal(r.error.type, 'network');
});

test('byok-compiler: an empty model body is a malformed-response, not a successful empty result', async () => {
  const empties = { id: 'e', async complete() { return '   '; } };
  const r = await refractOnce(empties, 'k', 'm', input);
  assert.equal(r.ok, false);
  assert.equal(r.error.type, 'malformed-response');
});

// branding.rename
test('branding: product name is a literal in exactly one file (single-source-of-truth)', () => {
  assert.equal(BRAND.productName, 'Catenator');
  const hits = walk(srcDir).filter(
    (f) => !f.endsWith(join('brand', 'brand.ts')) && readFileSync(f, 'utf8').includes(BRAND.productName)
  );
  assert.deepEqual(hits, [], `product name hardcoded outside brand.ts: ${hits}`);
});

test('branding.scan-for-prior-names: no retired name in the built source', () => {
  for (const f of walk(srcDir)) {
    if (f.endsWith(join('brand', 'brand.ts'))) continue;
    const text = readFileSync(f, 'utf8');
    for (const prior of PRIOR_NAMES) assert.ok(!text.includes(prior), `${prior} in ${f}`);
  }
});

test('style.visual-theme.no-icons-on-step-numbers: step-nav has no <app-icon>', () => {
  const nav = readFileSync(join(srcDir, 'app', 'ui', 'step-nav.ts'), 'utf8');
  assert.ok(!nav.includes('app-icon'), 'step-nav must not render an icon');
});
