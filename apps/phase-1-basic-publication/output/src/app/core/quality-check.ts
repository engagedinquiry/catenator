import type { Publication } from './models';
import { flattenTopics } from './tree';
import { danglingOverrideIds } from './sources';
import { undefinedVariableNames } from './variables';

/**
 * quality-check.four-checks — four validation checks against the publication,
 * shown in Panel 3's Quality Check tab.
 *
 * mustNever:
 *  - "Enforce any of these four checks live, while typing" -> this function is
 *     only ever called from an explicit "Run Quality Check" action, never from
 *     an input/keystroke handler (see ui/quality-check-panel.ts).
 *  - "Allow refraction to run if the persona-exists check fails" -> the
 *     `refractionAllowed` flag below is the persona-exists result; the refract
 *     action reads it (see core/publication-refract.ts + ui/refract-bar.ts).
 *
 * micro.check-report-is-per-item: every failure line names the specific topic,
 * source id, variable name, or persona gap — never a generic message.
 */
export type CheckId =
  | 'metadata-completeness'
  | 'source-reference-resolution'
  | 'variable-resolution'
  | 'persona-exists';

export interface CheckResult {
  id: CheckId;
  label: string;
  passed: boolean;
  /** one entry per specific failing item; empty when passed. */
  failures: string[];
}

export interface QualityReport {
  results: CheckResult[];
  /** persona-exists — the one check that gates refraction. */
  refractionAllowed: boolean;
}

export function runQualityCheck(pub: Publication): QualityReport {
  const topics = flattenTopics(pub.topics);
  const topicLabel = (id: string, name: string) => `“${name || '(unnamed topic)'}” (${id})`;

  // 1. metadata-completeness: every topic has at least a name filled in.
  const noName = topics.filter((t) => t.name.trim().length === 0);
  const metadataCompleteness: CheckResult = {
    id: 'metadata-completeness',
    label: 'Every topic has a name',
    passed: noName.length === 0,
    failures: noName.map((t) => `Topic ${t.id} has no name.`)
  };

  // 2. source-reference-resolution: every id in every topic's sourceOverride
  //    resolves to a real source in the publication's source list.
  const srcFailures: string[] = [];
  for (const t of topics) {
    for (const badId of danglingOverrideIds(t, pub.sources)) {
      srcFailures.push(`${topicLabel(t.id, t.name)} overrides to source id "${badId}", which does not exist.`);
    }
  }
  const sourceReferenceResolution: CheckResult = {
    id: 'source-reference-resolution',
    label: 'Every per-topic source override points at a real source',
    passed: srcFailures.length === 0,
    failures: srcFailures
  };

  // 3. variable-resolution: every {{name}} in any topic's content is defined.
  const varFailures: string[] = [];
  for (const t of topics) {
    for (const name of undefinedVariableNames(t.content, pub.variables)) {
      varFailures.push(`${topicLabel(t.id, t.name)} references {{${name}}}, which is not defined in Variables.`);
    }
  }
  const variableResolution: CheckResult = {
    id: 'variable-resolution',
    label: 'Every {{variable}} referenced in a topic is defined',
    passed: varFailures.length === 0,
    failures: varFailures
  };

  // 4. persona-exists: at least one persona before refraction is allowed.
  const personaExists: CheckResult = {
    id: 'persona-exists',
    label: 'At least one persona exists (required before refraction)',
    passed: pub.personas.length > 0,
    failures: pub.personas.length > 0 ? [] : ['No personas defined. Add at least one persona before refracting.']
  };

  return {
    results: [metadataCompleteness, sourceReferenceResolution, variableResolution, personaExists],
    refractionAllowed: personaExists.passed
  };
}
