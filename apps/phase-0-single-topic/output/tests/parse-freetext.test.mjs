import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSourcesFreetext, parsePersonasFreetext } from '../src/app/core/parse-freetext.ts';
import { FIXED_DIMENSIONS } from '../src/app/core/models.ts';

// input-mode.dual micro.parity-check-required: run the parser against the
// canonical fixtures and confirm the parsed result matches expected-parsed.yaml
// exactly — same entry counts, same field values, dimensions matched by name
// with no label present.
const FIX = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'fixtures',
  'rate-limiting'
);
const read = (f) => readFileSync(join(FIX, f), 'utf8');

// tiny YAML reader for the specific shape of expected-parsed.yaml (block scalars,
// simple lists). Not a general YAML parser.
function loadExpected() {
  const raw = read('expected-parsed.yaml').replace(/\r\n/g, '\n');
  const flat = (s) => s.replace(/\s+/g, ' ').trim();

  const topic = flat(raw.match(/topicText:\s*>-\n([\s\S]*?)\n\n\S/)[1]);

  const srcBlock = raw.match(/sources:\n([\s\S]*?)\npersonas:/)[1];
  const s = {
    title: srcBlock.match(/title:\s*"([^"]+)"/)[1],
    reference: srcBlock.match(/reference:\s*"([^"]+)"/)[1],
    description: flat(srcBlock.match(/description:\s*>-\n([\s\S]*)$/)[1])
  };

  const persBlock = raw.match(/personas:\n([\s\S]*)$/)[1];
  const personas = [...persBlock.matchAll(
    /- name:\s*"([^"]+)"\n\s*summary:\s*>-\n([\s\S]*?)\n\s*dimensions:\s*\[([^\]]*)\]/g
  )].map((m) => ({
    name: m[1],
    summary: flat(m[2]),
    dimensions: m[3].split(',').map((d) => d.trim().replace(/"/g, '')).filter(Boolean)
  }));

  return { topic, source: s, personas };
}

const expected = loadExpected();

test('parity: sources free text parses to exactly one source with the expected fields', () => {
  const p = parseSourcesFreetext(read('sources-freetext-markdown.md'));
  assert.equal(p.ok, true);
  assert.equal(p.sources.length, 1);
  assert.deepEqual(p.sources[0], expected.source);
  // clean-value-extraction: no "##", no leading label, no wrapping quotes
  for (const v of Object.values(p.sources[0])) {
    assert.ok(!v.includes('##'));
    assert.ok(!/^["'].*["']$/.test(v));
  }
});

test('parity: personas free text parses to exactly the expected personas', () => {
  const p = parsePersonasFreetext(read('personas-freetext.md'));
  assert.equal(p.ok, true);
  assert.equal(p.personas.length, expected.personas.length);
  p.personas.forEach((got, i) => {
    assert.equal(got.name, expected.personas[i].name);
    assert.equal(got.summary, expected.personas[i].summary);
    // dimensions matched by name, returned in canonical order, no label
    assert.deepEqual(got.dimensions, expected.personas[i].dimensions);
  });
});

test('parity: dimensions come back in the fixed canonical order even if written out of order', () => {
  // fixture writes "Context, Content" and "Trust, Content" — expected is canonical
  const p = parsePersonasFreetext(read('personas-freetext.md'));
  for (const persona of p.personas) {
    const canonicalIdx = persona.dimensions.map((d) => FIXED_DIMENSIONS.indexOf(d));
    assert.deepEqual(canonicalIdx, [...canonicalIdx].sort((a, b) => a - b));
  }
});

test('parse-only-what-is-stated: a dimension not written is not selected', () => {
  const p = parsePersonasFreetext('## R\n\nsummary here\n\nContent');
  assert.deepEqual(p.personas[0].dimensions, ['Content']);
});

test('parse-only-what-is-stated: a line with a non-dimension token is NOT treated as dimensions', () => {
  const p = parsePersonasFreetext('## R\n\nSummary line.\n\nContent, Frobnicate');
  // the "Content, Frobnicate" line is prose, not a dimension list
  assert.deepEqual(p.personas[0].dimensions, []);
  assert.ok(p.personas[0].summary.includes('Frobnicate'));
});

test('sources: a missing section is an explicit error, not a silent blank', () => {
  const p = parseSourcesFreetext('## Title\n\nX\n\n## Description\n\nY');
  assert.equal(p.ok, false);
  assert.ok(p.errors.some((e) => /Source/.test(e)));
});

test('sources: one labeled record stays ONE source', () => {
  const p = parseSourcesFreetext(read('sources-freetext-markdown.md'));
  assert.equal(p.sources.length, 1);
});
