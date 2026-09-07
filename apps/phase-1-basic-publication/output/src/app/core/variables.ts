import type { Variable } from './models';

/**
 * variable.substitution.
 *
 * micro.reference-syntax: a variable is referenced inside topic markdown as
 * {{variable_name}}, matching the `name` field exactly (case-sensitive).
 *
 * mustNever "Resolve or substitute a variable's value live while the author is
 * typing": there is deliberately NO substitute()/render() function exported
 * from this module. Resolution status is reported only by
 * quality-check.four-checks (variable-resolution). The Preview tab shows the raw
 * {{name}} token, unresolved.
 */

/** Case-sensitive: names are [A-Za-z0-9_]+ between doubled braces. */
export const VARIABLE_REFERENCE_RE = /\{\{([A-Za-z0-9_]+)\}\}/g;

/** Every distinct {{name}} referenced in a piece of content, in first-seen order. */
export function referencedVariableNames(content: string): string[] {
  const seen: string[] = [];
  for (const m of content.matchAll(VARIABLE_REFERENCE_RE)) {
    if (!seen.includes(m[1])) seen.push(m[1]);
  }
  return seen;
}

/** Names referenced in `content` that are not defined in `variables` (case-sensitive). */
export function undefinedVariableNames(content: string, variables: readonly Variable[]): string[] {
  const defined = new Set(variables.map((v) => v.name));
  return referencedVariableNames(content).filter((n) => !defined.has(n));
}
