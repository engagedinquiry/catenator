import type { SourceItem, TopicNode } from './models';

/**
 * source.with-override — resolve which sources a given topic actually uses.
 *
 * micro.default-is-all-sources: no sourceOverride => every publication source.
 * sourceOverride present => only the listed ids, replacing the default entirely
 * for that topic.
 *
 * mustNever "Let a topic's override remove or alter a source for any OTHER
 * topic": this function is pure and per-topic — it reads `topic.sourceOverride`
 * and never writes anything, so topic A's override cannot touch topic B.
 *
 * micro.override-references-real-sources-only: an id in the override that does
 * not match a real source is simply not resolved here; quality-check.four-checks
 * (source-reference-resolution) is what reports it to the author.
 */
export function resolveSourcesForTopic(
  topic: Pick<TopicNode, 'sourceOverride'>,
  allSources: readonly SourceItem[]
): SourceItem[] {
  if (topic.sourceOverride === null) return [...allSources];
  const wanted = new Set(topic.sourceOverride);
  return allSources.filter((s) => wanted.has(s.id));
}

/** Ids in a topic's override that do not correspond to any real source. */
export function danglingOverrideIds(
  topic: Pick<TopicNode, 'sourceOverride'>,
  allSources: readonly SourceItem[]
): string[] {
  if (topic.sourceOverride === null) return [];
  const real = new Set(allSources.map((s) => s.id));
  return topic.sourceOverride.filter((id) => !real.has(id));
}
