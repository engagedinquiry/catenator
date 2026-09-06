/**
 * gating.linear-sequential — pure step-ordering rules, no Angular.
 *
 * Each protected step names the state it requires and the step to fall back to
 * when that state is missing. `redirectTarget` walks to the earliest step whose
 * requirement is unmet (micro.redirect-on-incomplete).
 */

export interface FlowState {
  hasTopic: boolean;
  hasSources: boolean;
  hasPersonas: boolean;
  hasRefractions: boolean;
}

export type StepPath = 'intro' | 'topic' | 'sources' | 'personas' | 'refract' | 'publish';

interface Rule {
  step: StepPath;
  ok: (s: FlowState) => boolean;
  fallback: StepPath;
}

/** In flow order. `ok` is cumulative — a later step also needs all earlier state. */
export const GATE_RULES: Rule[] = [
  { step: 'sources', ok: (s) => s.hasTopic, fallback: 'topic' },
  { step: 'personas', ok: (s) => s.hasTopic && s.hasSources, fallback: 'sources' },
  { step: 'refract', ok: (s) => s.hasTopic && s.hasSources && s.hasPersonas, fallback: 'personas' },
  {
    step: 'publish',
    ok: (s) => s.hasTopic && s.hasSources && s.hasPersonas && s.hasRefractions,
    fallback: 'refract'
  }
];

/**
 * null = the step is reachable; otherwise the earliest incomplete step to
 * redirect to. Fallbacks are followed transitively so a single call lands on
 * the earliest unsatisfied step (the Angular guards would otherwise reach the
 * same place by re-running on each hop).
 */
export function redirectTarget(step: StepPath, state: FlowState): StepPath | null {
  let rule = GATE_RULES.find((r) => r.step === step);
  if (!rule || rule.ok(state)) return null;
  let target = rule.fallback;
  while ((rule = GATE_RULES.find((r) => r.step === target)) && !rule.ok(state)) {
    target = rule.fallback;
  }
  return target;
}
