import { test } from 'node:test';
import assert from 'node:assert/strict';
import { earliestIncomplete, canReach } from '../src/app/core/step-order.ts';

// gating.linear-sequential micro.redirect-on-incomplete: the earliest incomplete
// step is where a direct access to any later step redirects.
const s = (over) => ({
  hasTopic: () => !!over.topic,
  hasSources: () => !!over.sources,
  hasPersonas: () => !!over.personas,
  allRefracted: () => !!over.refracted
});

test('earliest incomplete walks the step order', () => {
  assert.equal(earliestIncomplete(s({})), 'topic');
  assert.equal(earliestIncomplete(s({ topic: 1 })), 'sources');
  assert.equal(earliestIncomplete(s({ topic: 1, sources: 1 })), 'personas');
  assert.equal(earliestIncomplete(s({ topic: 1, sources: 1, personas: 1 })), 'refract');
  assert.equal(earliestIncomplete(s({ topic: 1, sources: 1, personas: 1, refracted: 1 })), 'publish');
});

test('a gap in the middle still redirects to that gap, not further', () => {
  // personas done but sources missing -> still blocked at sources
  assert.equal(earliestIncomplete(s({ topic: 1, personas: 1, refracted: 1 })), 'sources');
});

test('canReach: intro + topic always open; later steps need everything before them', () => {
  assert.equal(canReach('intro', s({})), true);
  assert.equal(canReach('topic', s({})), true);
  assert.equal(canReach('sources', s({})), false);
  assert.equal(canReach('sources', s({ topic: 1 })), true);
  assert.equal(canReach('publish', s({ topic: 1, sources: 1, personas: 1 })), false);
  assert.equal(canReach('publish', s({ topic: 1, sources: 1, personas: 1, refracted: 1 })), true);
});
