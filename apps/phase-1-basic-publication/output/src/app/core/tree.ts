import type { TopicNode } from './models';
import { newId } from './ids';

/**
 * topic.hierarchy — pure, immutable operations on the arbitrary-depth topic
 * tree. No Angular here so the test suite can import it directly.
 *
 * mustNever:
 *  - "Assume or hardcode a maximum depth" -> every function recurses; nothing
 *     counts or caps levels (recursive-not-fixed-depth).
 *  - "Let 'move up'/'move down' change a topic's parent" -> moveSibling only
 *     ever reorders within one children[] array (move-reorders-siblings-only).
 *  - "silently orphan or delete its children" -> deleteTopic removes the whole
 *     subtree; countDescendants tells the caller how many, for the warning
 *     (delete-warns-about-children).
 */

export function makeTopic(name = ''): TopicNode {
  return { id: newId('topic'), name, metadata: {}, content: '', sourceOverride: null, children: [] };
}

/** Depth-first pre-order: parent before its children, siblings in array order. */
export function flattenTopics(topics: readonly TopicNode[]): TopicNode[] {
  const out: TopicNode[] = [];
  const walk = (nodes: readonly TopicNode[]) => {
    for (const n of nodes) {
      out.push(n);
      walk(n.children);
    }
  };
  walk(topics);
  return out;
}

export function findTopic(topics: readonly TopicNode[], id: string): TopicNode | null {
  for (const n of topics) {
    if (n.id === id) return n;
    const hit = findTopic(n.children, id);
    if (hit) return hit;
  }
  return null;
}

/** Number of topics strictly beneath `id` (children, grandchildren, …). */
export function countDescendants(topics: readonly TopicNode[], id: string): number {
  const node = findTopic(topics, id);
  if (!node) return 0;
  return flattenTopics(node.children).length;
}

/** Return a new tree with `updater` applied to the node with `id`. */
export function updateTopic(
  topics: readonly TopicNode[],
  id: string,
  updater: (t: TopicNode) => TopicNode
): TopicNode[] {
  return topics.map((n) => {
    if (n.id === id) return updater(n);
    return { ...n, children: updateTopic(n.children, id, updater) };
  });
}

/** Append a new empty topic as the last root topic. */
export function addRootTopic(topics: readonly TopicNode[], name = ''): TopicNode[] {
  return [...topics, makeTopic(name)];
}

/**
 * add-child-topic: "Add child topic" on any topic creates a new topic nested
 * one level beneath it, appended as the last child.
 */
export function addChildTopic(topics: readonly TopicNode[], parentId: string, name = ''): TopicNode[] {
  return updateTopic(topics, parentId, (p) => ({ ...p, children: [...p.children, makeTopic(name)] }));
}

/**
 * delete-warns-about-children: the caller is responsible for showing the
 * countDescendants warning first; this just removes the subtree.
 */
export function deleteTopic(topics: readonly TopicNode[], id: string): TopicNode[] {
  return topics
    .filter((n) => n.id !== id)
    .map((n) => ({ ...n, children: deleteTopic(n.children, id) }));
}

/**
 * move-reorders-siblings-only: swap `id` with its immediate sibling in
 * `direction`. If there is none (already first/last), it is a no-op, not an
 * error. The topic's parent is never changed.
 */
export function moveSibling(
  topics: readonly TopicNode[],
  id: string,
  direction: 'up' | 'down'
): TopicNode[] {
  const reorder = (nodes: readonly TopicNode[]): TopicNode[] => {
    const idx = nodes.findIndex((n) => n.id === id);
    if (idx !== -1) {
      const swapWith = direction === 'up' ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= nodes.length) return [...nodes]; // no sibling => no-op
      const next = [...nodes];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return next;
    }
    return nodes.map((n) => ({ ...n, children: reorder(n.children) }));
  };
  return reorder(topics);
}
