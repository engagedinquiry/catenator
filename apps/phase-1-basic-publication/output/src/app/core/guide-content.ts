import type { SelectionType } from './models';

/**
 * guide.static-per-selection — exactly five pre-written blocks, one per
 * selection type (micro.five-fixed-blocks). Not generated, not reactive to the
 * content being edited. There is no sixth block and no per-topic variation
 * within "topic".
 */
export const GUIDE_BLOCKS: Record<SelectionType, { title: string; body: string[] }> = {
  publication: {
    title: 'Publication',
    body: [
      'This is the publication itself — its display name and any publication-wide metadata.',
      'It is the top-level entry point: on a fresh load, this is what you see.',
      'Publication metadata is separate from every individual topic\'s metadata.'
    ]
  },
  topic: {
    title: 'Topic',
    body: [
      'A topic holds markdown content. Edit it under the Editor tab; check how it reads under Preview.',
      'Topics form a hierarchy of any depth. Use “Add child topic” to nest one beneath another; use move up / move down to reorder a topic among its siblings only.',
      'A topic uses every publication source by default. Set a source override in its Metadata tab to narrow that to a specific subset, for this topic only.',
      'Reference a publication variable inside content as {{variable_name}}. It is not substituted as you type — Quality Check reports any that are undefined.'
    ]
  },
  variables: {
    title: 'Variables',
    body: [
      'Publication-level name/value pairs, shared across every topic.',
      'Reference one inside topic content as {{name}}, matching the name exactly (case-sensitive).',
      'Values are not substituted live while you type. Quality Check verifies that every referenced variable is defined.'
    ]
  },
  sources: {
    title: 'Sources',
    body: [
      'The publication\'s source list — title, reference, description — available by default to every topic.',
      'Any single topic can override this set for itself, in that topic\'s Metadata tab. An override never changes the sources available to other topics.',
      'Refraction grounds each topic strictly in that topic\'s content plus its resolved sources.'
    ]
  },
  personas: {
    title: 'Personas',
    body: [
      'Up to two personas, shared across the whole publication. A third cannot be added.',
      'Each persona has a name, a summary, and a set of dimensions drawn from the five fixed names: Surface, Content, Context, Time, Trust.',
      'Persona ids are positional — the first is persona-0, the second persona-1 — assigned once and unchanged if you later edit the name or summary.',
      'At least one persona must exist before refraction can run.'
    ]
  }
};
