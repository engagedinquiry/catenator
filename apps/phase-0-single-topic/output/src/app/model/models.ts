/**
 * Data models for the phase-0 single-topic refraction lab.
 *
 * state.topic-refraction holds: topicText, sources[], personas[] (max 2),
 * refractedOutputs (map keyed by personaId).
 */

/** One grounding source behind the topic. */
export interface SourceItem {
  /** Short human title. */
  title: string;
  /** Where it comes from (URL, doc name, ADR number, system of record). */
  reference: string;
  /** What it covers and why it matters. */
  description: string;
}

export function emptySource(): SourceItem {
  return { title: '', reference: '', description: '' };
}

/** The five fixed refraction dimensions. Canonical order — never reordered. */
export const DIMENSIONS = ['Surface', 'Content', 'Context', 'Time', 'Trust'] as const;
export type Dimension = (typeof DIMENSIONS)[number];

export const DIMENSION_HINTS: Record<Dimension, string> = {
  Surface: 'Format & density — prose vs. code vs. tables vs. diagrams; how much detail on screen.',
  Content: 'Depth & posture — conceptual overview vs. procedural runbook vs. analytical deep-dive.',
  Context: 'Framing — what the reader is doing, what they already know, what decision they face.',
  Time: 'Reading budget — 30-second skim vs. standard read vs. deep study.',
  Trust: 'Evidence bar — assertion vs. cited sources vs. audit-grade provenance.'
};

/** Case-insensitive lookup from a token to a canonical Dimension, or null. */
export function matchDimension(token: string): Dimension | null {
  const t = token.trim().toLowerCase();
  return DIMENSIONS.find((d) => d.toLowerCase() === t) ?? null;
}

export interface Persona {
  /** Stable slug used by the delivery endpoint's persona selector. */
  id: string;
  /** Display name, e.g. "First-time integrator". */
  name: string;
  /** One line: who they are and what they read for. */
  summary: string;
  /** Which of the five dimensions matter most, in canonical order. */
  dimensions: Dimension[];
}

export function emptyPersona(id: string): Persona {
  return { id, name: '', summary: '', dimensions: [] };
}

/** Hard cap — system.yaml mustNever "Allow more than 2 personas per topic". */
export const MAX_PERSONAS = 2;

/** One persona's refracted output. refractedOutputs map value. */
export interface Refraction {
  personaId: string;
  personaName: string;
  output: string;
  provider: string;
  model: string;
}

/** byok-compiler.contract errorOutput shape. */
export interface CompilerError {
  type: 'network' | 'rate-limit' | 'malformed-response';
  message: string;
  retryable: boolean;
}
