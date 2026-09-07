import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { flattenTopics } from '../src/app/core/tree.ts';
import { resolveSourcesForTopic, danglingOverrideIds } from '../src/app/core/sources.ts';
import { referencedVariableNames } from '../src/app/core/variables.ts';
import { runQualityCheck } from '../src/app/core/quality-check.ts';
import { refractPublication } from '../src/app/core/publication-refract.ts';
import { refractionKey } from '../src/app/core/models.ts';

const FIX = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'fixtures', 'rate-limiting');
const pub = JSON.parse(readFileSync(join(FIX, 'publication.json'), 'utf8'));
const expected = JSON.parse(readFileSync(join(FIX, 'expected.json'), 'utf8'));

test('fixture: flattened topic order matches expected (depth-first pre-order)', () => {
  assert.deepEqual(flattenTopics(pub.topics).map((t) => t.id), expected.flattenedTopicIdsInOrder);
});

test('fixture: resolved sources per topic match expected (default vs override)', () => {
  for (const t of flattenTopics(pub.topics)) {
    const ids = resolveSourcesForTopic(t, pub.sources).map((s) => s.id).sort();
    assert.deepEqual(ids, [...expected.resolvedSourceIdsByTopic[t.id]].sort(), `sources for ${t.id}`);
    assert.deepEqual(danglingOverrideIds(t, pub.sources), expected.danglingOverrideIdsByTopic[t.id]);
  }
});

test('fixture: referenced variables per topic match expected', () => {
  for (const t of flattenTopics(pub.topics)) {
    assert.deepEqual(referencedVariableNames(t.content), expected.referencedVariablesByTopic[t.id], `vars in ${t.id}`);
  }
});

test('fixture: quality check is all-pass and allows refraction', () => {
  const r = runQualityCheck(pub);
  const got = Object.fromEntries(r.results.map((c) => [c.id, c.passed]));
  assert.deepEqual(got, {
    'metadata-completeness': expected.qualityCheck['metadata-completeness'],
    'source-reference-resolution': expected.qualityCheck['source-reference-resolution'],
    'variable-resolution': expected.qualityCheck['variable-resolution'],
    'persona-exists': expected.qualityCheck['persona-exists']
  });
  assert.equal(r.refractionAllowed, expected.qualityCheck.refractionAllowed);
});

test('fixture: one refraction action makes exactly topics × personas calls', async () => {
  let calls = 0;
  const transport = {
    id: 'fake',
    async complete() {
      calls += 1;
      // echo something trivially grounded (no specific claims) so grounding passes
      return 'This topic is explained for the reader.';
    }
  };
  const res = await refractPublication(pub, transport, 'key', 'model');
  assert.equal(res.ran, true);
  assert.equal(calls, expected.refraction.expectedCallCount);
  assert.equal(res.cells.size, expected.refraction.expectedCallCount);
  // every (topic, persona) pair present
  for (const t of flattenTopics(pub.topics)) {
    for (const p of pub.personas) {
      assert.ok(res.cells.has(refractionKey(t.id, p.id)), `missing cell ${t.id}/${p.id}`);
    }
  }
});
