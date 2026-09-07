import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  makeTopic,
  flattenTopics,
  findTopic,
  countDescendants,
  addRootTopic,
  addChildTopic,
  deleteTopic,
  moveSibling,
  updateTopic
} from '../src/app/core/tree.ts';
import { __resetIdCounter } from '../src/app/core/ids.ts';

/** Build a deep tree by hand so we control ids. */
function deepTree() {
  const leaf = { id: 'd', name: 'd', metadata: {}, content: '', sourceOverride: null, children: [] };
  const c = { id: 'c', name: 'c', metadata: {}, content: '', sourceOverride: null, children: [leaf] };
  const b = { id: 'b', name: 'b', metadata: {}, content: '', sourceOverride: null, children: [c] };
  const a = { id: 'a', name: 'a', metadata: {}, content: '', sourceOverride: null, children: [b] };
  return [a];
}

test('topic.hierarchy: tree supports arbitrary depth — no level cap anywhere', () => {
  let topics = deepTree();
  // add a child 4 levels down, then 5, then 6 — nothing rejects it
  topics = addChildTopic(topics, 'd', 'e');
  const e = findTopic(topics, findTopic(topics, 'd').children[0].id);
  topics = addChildTopic(topics, e.id, 'f');
  const flat = flattenTopics(topics);
  assert.equal(flat.length, 6, 'a, b, c, d, e, f');
  // depth-first pre-order
  assert.deepEqual(flat.slice(0, 4).map((t) => t.name), ['a', 'b', 'c', 'd']);
});

test('add-child-topic: appended as the LAST child, one level beneath', () => {
  let topics = [makeTopic('root')];
  const rootId = topics[0].id;
  topics = addChildTopic(topics, rootId, 'first');
  topics = addChildTopic(topics, rootId, 'second');
  const root = findTopic(topics, rootId);
  assert.deepEqual(root.children.map((c) => c.name), ['first', 'second']);
});

test('move-reorders-siblings-only: swaps with the immediate sibling, never changes parent', () => {
  let topics = deepTree(); // a > b > c > d
  topics = addChildTopic(topics, 'a', 'b2'); // a now has [b, b2]
  const b2Id = findTopic(topics, 'a').children[1].id;
  topics = moveSibling(topics, b2Id, 'up'); // -> [b2, b]
  const a = findTopic(topics, 'a');
  assert.equal(a.children[0].name, 'b2');
  assert.equal(a.children[1].id, 'b');
  // b still has its child c — parent relationships untouched
  assert.equal(findTopic(topics, 'b').children[0].id, 'c');
  // b2 did NOT become a child of anything else — still a's child
  assert.equal(a.children.length, 2);
});

test('move up/down at the ends is a no-op, not an error', () => {
  let topics = [makeTopic('one'), makeTopic('two')];
  const [a, b] = topics.map((t) => t.id);
  const same = moveSibling(topics, a, 'up'); // already first
  assert.deepEqual(same.map((t) => t.id), [a, b]);
  const same2 = moveSibling(topics, b, 'down'); // already last
  assert.deepEqual(same2.map((t) => t.id), [a, b]);
});

test('delete removes the whole subtree; countDescendants reports how many first', () => {
  const topics = deepTree(); // a > b > c > d  => a has 3 descendants
  assert.equal(countDescendants(topics, 'a'), 3);
  assert.equal(countDescendants(topics, 'c'), 1);
  const after = deleteTopic(topics, 'b');
  assert.equal(findTopic(after, 'b'), null);
  assert.equal(findTopic(after, 'c'), null, 'child went with it');
  assert.equal(findTopic(after, 'd'), null, 'grandchild went with it');
  assert.equal(findTopic(after, 'a').children.length, 0);
});

test('topic-id-is-stable: id is unchanged by move and by adding/removing children', () => {
  __resetIdCounter();
  let topics = addRootTopic([], 'x');
  const id = topics[0].id;
  topics = addChildTopic(topics, id, 'y');
  topics = addRootTopic(topics, 'z');
  topics = moveSibling(topics, id, 'down');
  topics = updateTopic(topics, id, (t) => ({ ...t, name: 'renamed' }));
  const moved = findTopic(topics, id);
  assert.ok(moved);
  assert.equal(moved.id, id, 'same id after child add + move + rename');
  assert.equal(moved.name, 'renamed');
});
