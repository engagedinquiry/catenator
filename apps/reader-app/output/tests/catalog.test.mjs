import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PERSONA_CATALOG, personaById } from '../src/app/core/persona-catalog.ts';
import { resolveContentPath, CONTENT_ROOT } from '../src/app/core/build-config.ts';

test('persona.catalog: exactly the six fixed personas (micro.fixed-list-only)', () => {
  assert.deepEqual(
    PERSONA_CATALOG.map((p) => p.id),
    ['creators', 'tech-writers', 'knowledge-teams', 'integrators', 'engineers', 'governing-docs']
  );
});

test('persona.catalog: every sourceFolder is relative, never absolute (micro.relative-to-config)', () => {
  for (const p of PERSONA_CATALOG) {
    assert.ok(!p.sourceFolder.startsWith('/'), `${p.id} is absolute`);
    assert.ok(!/^[A-Za-z]:\\/.test(p.sourceFolder), `${p.id} is a drive path`);
    assert.ok(!/(^|\/)docs\//.test(p.sourceFolder), `${p.id} hardcodes the root`);
  }
});

test('persona.catalog: sourceFolder resolves under the single content root', () => {
  const url = resolveContentPath(personaById('engineers').sourceFolder, 'refraction.md');
  assert.equal(url, `${CONTENT_ROOT}/engineers/refraction.md`);
});

test('persona.catalog: unknown id yields undefined, not a guess', () => {
  assert.equal(personaById('marketing'), undefined);
});
