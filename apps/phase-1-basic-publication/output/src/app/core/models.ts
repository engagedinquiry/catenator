/**
 * Shared types + this app's own canonical constants.
 *
 * system.yaml → contentScope.fixedDimensions is THIS app's single authority for
 * the five fixed dimensions. It matches phase-0-single-topic's list by value,
 * not by cross-app file reference — the two apps are separate deployable units
 * (persona.catalog.five-fixed-dimensions).
 */
export const FIXED_DIMENSIONS = ['Surface', 'Content', 'Context', 'Time', 'Trust'] as const;
export type Dimension = (typeof FIXED_DIMENSIONS)[number];

/** system.yaml mustNever "Allow more than 2 personas in the publication". */
export const MAX_PERSONAS = 2;

/** persona.catalog — identical shape to phase-0-single-topic's persona model. */
export interface Persona {
  id: string;
  name: string;
  summary: string;
  dimensions: Dimension[];
}

/** source.with-override — publication-level source, addressed by a stable id. */
export interface SourceItem {
  id: string;
  title: string;
  reference: string;
  description: string;
}

/** variable.substitution — a publication-level name/value pair. */
export interface Variable {
  name: string;
  value: string;
}

/**
 * publication.metadata — the publication's own top-level identity.
 * "structured, extensible — at minimum displayName": extra publication-wide
 * fields live in `extra`, keeping `displayName` strongly typed.
 */
export interface PublicationMeta {
  displayName: string;
  extra?: Record<string, string>;
}

/**
 * topic.hierarchy — a node in the arbitrary-depth topic tree.
 * `sourceOverride`: null => use every publication source (default);
 * a list of source ids => use only those, for this topic only.
 * `id` is assigned once at creation and never changes (topic-id-is-stable).
 */
export interface TopicNode {
  id: string;
  name: string;
  metadata: Record<string, string>;
  content: string;
  sourceOverride: string[] | null;
  children: TopicNode[];
}

/** The whole authored publication. */
export interface Publication {
  meta: PublicationMeta;
  topics: TopicNode[];
  sources: SourceItem[];
  personas: Persona[];
  variables: Variable[];
}

/**
 * byok-compiler.contract.errorOutput — carried over from phase-0-single-topic
 * unchanged (refraction.publication-level.same-failure-behavior-as-phase-0).
 */
export interface CompilerError {
  type: 'network' | 'rate-limit' | 'malformed-response' | 'ungrounded-claim';
  message: string;
  retryable: boolean;
}

/** One cell of the publication-wide refraction result grid. */
export interface RefractionCell {
  topicId: string;
  personaId: string;
  ok: boolean;
  text?: string;
  error?: CompilerError;
}

/** refractedOutputs is keyed by this exact string. */
export function refractionKey(topicId: string, personaId: string): string {
  return `${topicId}::${personaId}`;
}

/** The five things selectable in Panel 1 (layout.three-panel.accordion-sections-fixed). */
export type SelectionType = 'publication' | 'topic' | 'variables' | 'sources' | 'personas';

export interface Selection {
  type: SelectionType;
  /** set only when type === 'topic'. */
  topicId?: string;
}
