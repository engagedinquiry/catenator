/**
 * gating.linear-sequential — a later step accessed without prior data redirects
 * to the earliest incomplete step; a satisfied step is reachable.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { redirectTarget } from '../src/app/core/gate-rules.ts';

const none = { hasTopic: false, hasSources: false, hasPersonas: false, hasRefractions: false };
const topicOnly = { ...none, hasTopic: true };
const throughPersonas = { hasTopic: true, hasSources: true, hasPersonas: true, hasRefractions: false };
const complete = { hasTopic: true, hasSources: true, hasPersonas: true, hasRefractions: true };

test('intro/topic are always reachable', () => {
  assert.equal(redirectTarget('intro', none), null);
  assert.equal(redirectTarget('topic', none), null);
});

test('jumping to publish with nothing done redirects to topic (earliest incomplete)', () => {
  assert.equal(redirectTarget('publish', none), 'topic');
  assert.equal(redirectTarget('refract', none), 'topic');
});

test('with steps 1-3 done, refract is reachable but publish still redirects to refract', () => {
  assert.equal(redirectTarget('refract', throughPersonas), null);
  assert.equal(redirectTarget('publish', throughPersonas), 'refract');
});

test('a click on "sources" before a topic exists redirects to topic', () => {
  assert.equal(redirectTarget('sources', none), 'topic');
  assert.equal(redirectTarget('sources', topicOnly), null);
});

test('every step reachable once the whole flow is complete', () => {
  for (const step of ['sources', 'personas', 'refract', 'publish']) {
    assert.equal(redirectTarget(step, complete), null);
  }
});
