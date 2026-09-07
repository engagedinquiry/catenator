/**
 * Shared types + the one canonical dimension list.
 *
 * system.yaml → contentScope.fixedDimensions is the single authority for
 * "the five fixed dimensions". Every component that names them
 * (input-mode.dual.personas-format, the personas form) reads this constant.
 */
export const FIXED_DIMENSIONS = ['Surface', 'Content', 'Context', 'Time', 'Trust'] as const;
export type Dimension = (typeof FIXED_DIMENSIONS)[number];

/** system.yaml mustNever "Allow more than 2 personas per topic". */
export const MAX_PERSONAS = 2;

export interface SourceItem {
  title: string;
  reference: string;
  description: string;
}

/**
 * state.topic-refraction: personas are {id, name, summary, dimensions[]}.
 * micro.persona-id-is-positional: id is "persona-0" / "persona-1" by authoring
 * order, assigned once, never changed on edit.
 */
export interface Persona {
  id: string;
  name: string;
  summary: string;
  dimensions: Dimension[];
}

/** byok-compiler.contract output. */
export interface Refraction {
  personaId: string;
  text: string;
}

/** byok-compiler.contract.errorOutput. */
export interface CompilerError {
  type: 'network' | 'rate-limit' | 'malformed-response';
  message: string;
  retryable: boolean;
}

/** delivery.request-response.errorOutput (both variants). */
export type DeliveryError =
  | { type: 'not-yet-refracted'; message: string }
  | { type: 'ungrounded-claim'; message: string };
