/**
 * Stable id generation.
 *
 * topic.hierarchy.topic-id-is-stable: a topic id is assigned once at creation
 * and never recomputed. source ids are the same — they are referenced by
 * per-topic overrides, so they must not change.
 *
 * persona.catalog.persona-id-is-positional is the ONE exception and is handled
 * in publication-store.ts, not here: persona ids are "persona-0" / "persona-1"
 * by authoring order.
 */
let counter = 0;

export function newId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** test-only: make id sequences deterministic. */
export function __resetIdCounter(): void {
  counter = 0;
}
