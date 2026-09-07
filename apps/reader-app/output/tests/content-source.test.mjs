import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TOPIC_MAP,
  fileFor,
  topicsForPersona,
  standardFileUrl,
  STANDARD_REFERENCE
} from '../src/app/core/content-source.ts';
import { CONTENT_ROOT } from '../src/app/core/build-config.ts';

test('content.source: fileFor stays inside the requested persona folder', () => {
  const r = fileFor('refraction', 'creators');
  assert.equal(r.available, true);
  assert.equal(r.url, `${CONTENT_ROOT}/creators/refraction.md`);
  assert.ok(!r.url.includes('/engineers/'));
});

test('content.source: filenames differ per persona for the same topic', () => {
  assert.equal(fileFor('governing-document', 'creators').url, `${CONTENT_ROOT}/creators/design-document.md`);
  assert.equal(fileFor('governing-document', 'engineers').url, `${CONTENT_ROOT}/engineers/governing-document.md`);
});

test('content.source: null topicMap entry => not available, not a blank path (micro.null-means-unavailable)', () => {
  assert.deepEqual(fileFor('governing-document', 'governing-docs'), { available: false });
  assert.deepEqual(fileFor('mechanics', 'governing-docs'), { available: false });
  assert.deepEqual(fileFor('schemas-and-specifications', 'creators'), { available: false });
});

test('content.source: schemas-and-specifications is only for governing-docs', () => {
  assert.equal(fileFor('schemas-and-specifications', 'governing-docs').available, true);
  for (const id of ['creators', 'tech-writers', 'knowledge-teams', 'integrators', 'engineers']) {
    assert.equal(fileFor('schemas-and-specifications', id).available, false);
  }
});

test('content.source: topicsForPersona reflects the non-null rows', () => {
  const gov = topicsForPersona('governing-docs');
  assert.ok(gov.has('start'));
  assert.ok(gov.has('schemas-and-specifications'));
  assert.ok(!gov.has('governing-document'));
  assert.ok(!gov.has('mechanics'));
});

test('content.source: the standard reference is one persona-invariant path', () => {
  assert.equal(standardFileUrl(), `${CONTENT_ROOT}/${STANDARD_REFERENCE.path}${STANDARD_REFERENCE.entryFile}`);
  // it is not a topic in TOPIC_MAP
  assert.equal(TOPIC_MAP.find((t) => t.id === 'standard'), undefined);
});
