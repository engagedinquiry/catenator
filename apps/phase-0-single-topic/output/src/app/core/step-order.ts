/**
 * gating.linear-sequential — the pure step-order logic (no Angular), so it is
 * unit-testable and shared by the route guards.
 *
 * micro.redirect-on-incomplete: `earliestIncomplete` names the step a direct
 * access to any later step must redirect to.
 */
export const STEP_ORDER = ['intro', 'topic', 'sources', 'personas', 'refract', 'publish'] as const;
export type StepPath = (typeof STEP_ORDER)[number];

/** The completion signals, read from state.topic-refraction. */
export interface Completion {
  hasTopic(): boolean;
  hasSources(): boolean;
  hasPersonas(): boolean;
  allRefracted(): boolean;
}

export function earliestIncomplete(s: Completion): StepPath {
  if (!s.hasTopic()) return 'topic';
  if (!s.hasSources()) return 'sources';
  if (!s.hasPersonas()) return 'personas';
  if (!s.allRefracted()) return 'refract';
  return 'publish';
}

/**
 * True iff `target` is reachable now. `intro` and `topic` are always reachable;
 * every other step needs everything before it complete.
 */
export function canReach(target: StepPath, s: Completion): boolean {
  const targetIdx = STEP_ORDER.indexOf(target);
  if (targetIdx <= 1) return true;
  const needIdx = STEP_ORDER.indexOf(earliestIncomplete(s));
  return targetIdx <= needIdx;
}
