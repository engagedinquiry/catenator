import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runQualityCheck } from '../src/app/core/quality-check.ts';

function topic(over) {
  return { id: 't1', name: 'T', metadata: {}, content: '', sourceOverride: null, children: [], ...over };
}
function pub(over) {
  return {
    meta: { displayName: 'P' },
    topics: [topic()],
    sources: [{ id: 's1', title: 'S', reference: '', description: '' }],
    personas: [{ id: 'persona-0', name: 'A', summary: '', dimensions: [] }],
    variables: [],
    ...over
  };
}

const byId = (r) => Object.fromEntries(r.results.map((c) => [c.id, c]));

test('a fully valid publication passes all four checks and allows refraction', () => {
  const r = runQualityCheck(pub());
  const c = byId(r);
  assert.ok(c['metadata-completeness'].passed);
  assert.ok(c['source-reference-resolution'].passed);
  assert.ok(c['variable-resolution'].passed);
  assert.ok(c['persona-exists'].passed);
  assert.equal(r.refractionAllowed, true);
});

test('metadata-completeness names the specific unnamed topic', () => {
  const r = runQualityCheck(pub({ topics: [topic({ id: 'bare', name: '  ' })] }));
  const c = byId(r)['metadata-completeness'];
  assert.equal(c.passed, false);
  assert.equal(c.failures.length, 1);
  assert.match(c.failures[0], /bare/);
});

test('source-reference-resolution names the topic and the bad source id', () => {
  const r = runQualityCheck(pub({ topics: [topic({ sourceOverride: ['s1', 'nope'] })] }));
  const c = byId(r)['source-reference-resolution'];
  assert.equal(c.passed, false);
  assert.match(c.failures[0], /"nope"/);
  assert.match(c.failures[0], /t1/);
});

test('variable-resolution names the topic and the undefined variable', () => {
  const r = runQualityCheck(
    pub({ topics: [topic({ content: 'refers to {{missing}} here' })], variables: [{ name: 'other', value: 'x' }] })
  );
  const c = byId(r)['variable-resolution'];
  assert.equal(c.passed, false);
  assert.match(c.failures[0], /\{\{missing\}\}/);
});

test('persona-exists fails with no personas and blocks refraction (mustNever)', () => {
  const r = runQualityCheck(pub({ personas: [] }));
  const c = byId(r)['persona-exists'];
  assert.equal(c.passed, false);
  assert.equal(r.refractionAllowed, false, 'refraction must not be allowed when persona-exists fails');
  assert.match(c.failures[0], /persona/i);
});

test('check-report-is-per-item: multiple failures produce one line each, none generic', () => {
  const r = runQualityCheck(
    pub({
      topics: [
        topic({ id: 'x', name: '', content: '{{a}} {{b}}' }),
        topic({ id: 'y', name: 'Y', sourceOverride: ['bad1', 'bad2'] })
      ],
      variables: []
    })
  );
  const c = byId(r);
  assert.equal(c['metadata-completeness'].failures.length, 1);
  assert.equal(c['variable-resolution'].failures.length, 2);
  assert.equal(c['source-reference-resolution'].failures.length, 2);
  for (const line of [...c['variable-resolution'].failures, ...c['source-reference-resolution'].failures]) {
    assert.doesNotMatch(line, /something is wrong/i);
  }
});
