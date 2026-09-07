/**
 * content.source — maps each topic to the actual markdown file per persona, and
 * exposes the schema reference folder (the standard itself) as persona-invariant
 * reference material.
 *
 * mustNever:
 *  - "Show a persona a file from a different persona's folder" -> fileFor() only
 *    ever joins persona.sourceFolder with that persona's own filename entry.
 *  - "Treat the schema reference folder as if it varies per persona" -> the
 *    standard reference is one path, not part of TOPIC_MAP.
 *  - "Fail silently if a topic's file is missing" -> a null entry is surfaced as
 *    {available:false} and rendered as an explicit "not covered" message.
 *  - "Hardcode a source root path" -> every path goes through resolveContentPath().
 *
 * NOTE: content-source.yaml gives standardReference.path as "schema/"; the docs
 * restructure renamed that folder to "schemas/", so STANDARD_REFERENCE.path uses
 * the current name. Still a single value, still joined onto the content root.
 */
import { resolveContentPath } from './build-config';
import { PERSONA_CATALOG, personaById } from './persona-catalog';

export interface TopicDef {
  readonly id: string;
  readonly label: string;
  /** filename per persona id; null = no equivalent file for that persona. */
  readonly filenames: Readonly<Record<string, string | null>>;
}

export const TOPIC_MAP: readonly TopicDef[] = [
  {
    id: 'start',
    label: 'Start here',
    filenames: {
      creators: 'README.md',
      'tech-writers': 'README.md',
      'knowledge-teams': 'README.md',
      integrators: 'README.md',
      engineers: 'README.md',
      'governing-docs': 'README.md'
    }
  },
  {
    id: 'governing-document',
    label: 'Governing document',
    filenames: {
      creators: 'design-document.md',
      'tech-writers': 'governing-document.md',
      'knowledge-teams': 'governing-document.md',
      integrators: 'governing-document.md',
      engineers: 'governing-document.md',
      'governing-docs': null
    }
  },
  {
    id: 'refraction',
    label: 'Refraction',
    filenames: {
      creators: 'refraction.md',
      'tech-writers': 'refraction.md',
      'knowledge-teams': 'refraction.md',
      integrators: 'refraction.md',
      engineers: 'refraction.md',
      'governing-docs': 'refraction.md'
    }
  },
  {
    id: 'mechanics',
    label: 'Mechanics of refraction',
    filenames: {
      creators: 'mechanics-of-refraction.md',
      'tech-writers': 'mechanics-of-refraction.md',
      'knowledge-teams': 'mechanics-of-refraction.md',
      integrators: 'mechanics-of-refraction.md',
      engineers: 'mechanics-of-refraction.md',
      'governing-docs': null
    }
  },
  {
    id: 'delivery',
    label: 'Delivering with a paradigm shift',
    filenames: {
      creators: 'delivering-with-a-paradigm-shift.md',
      'tech-writers': 'delivering-with-a-paradigm-shift.md',
      'knowledge-teams': 'delivering-with-a-paradigm-shift.md',
      integrators: 'delivering-with-a-paradigm-shift.md',
      engineers: 'delivering-with-a-paradigm-shift.md',
      'governing-docs': 'delivering-with-a-paradigm-shift.md'
    }
  },
  {
    id: 'schemas-and-specifications',
    label: 'Schemas and specifications',
    filenames: {
      creators: null,
      'tech-writers': null,
      'knowledge-teams': null,
      integrators: null,
      engineers: null,
      'governing-docs': 'schemas-and-specifications.md'
    }
  }
];

/** Persona-invariant: the standard itself, same for every reader. */
export const STANDARD_REFERENCE = {
  path: 'schemas/',
  label: 'The Catenator standard',
  /** entry document rendered when the standard area opens. */
  entryFile: 'catenator-standard.md'
} as const;

export function topicById(id: string): TopicDef | undefined {
  return TOPIC_MAP.find((t) => t.id === id);
}

export type FileLookup =
  | { available: true; url: string }
  | { available: false };

/**
 * The path to a topic's file for one persona, or {available:false} when the
 * topicMap entry is null. Never crosses persona folders.
 */
export function fileFor(topicId: string, personaId: string): FileLookup {
  const topic = topicById(topicId);
  const persona = personaById(personaId);
  if (!topic || !persona) return { available: false };
  const filename = topic.filenames[persona.id] ?? null;
  if (filename === null) return { available: false };
  return { available: true, url: resolveContentPath(persona.sourceFolder, filename) };
}

/** URL for one document inside the standard reference folder. */
export function standardFileUrl(filename: string = STANDARD_REFERENCE.entryFile): string {
  return resolveContentPath(STANDARD_REFERENCE.path, filename);
}

/** Topics that have a file for the given persona (used to disable dead rows). */
export function topicsForPersona(personaId: string): Set<string> {
  const persona = personaById(personaId);
  if (!persona) return new Set();
  return new Set(
    TOPIC_MAP.filter((t) => (t.filenames[persona.id] ?? null) !== null).map((t) => t.id)
  );
}

export const ALL_PERSONA_IDS = PERSONA_CATALOG.map((p) => p.id);

/**
 * Reverse of the topicMap: given a persona and a raw filename (as it appears in
 * a markdown link inside docs/README.md, e.g. "design-document.md"), the topic
 * id that file backs for that persona — or null if that persona has no such
 * topic. Used by navigation.routes to turn README links into internal routes.
 */
export function topicIdForFilename(personaId: string, filename: string): string | null {
  const name = filename.replace(/^\.?\//, '').split('/').pop() ?? filename;
  for (const t of TOPIC_MAP) {
    if ((t.filenames[personaId] ?? null) === name) return t.id;
  }
  return null;
}

/**
 * navigation.routes micro.home-link-interception: parse an href from the home
 * README. If it points into a known persona's sourceFolder, return the internal
 * route segments; if it is a "#personaId" anchor, likewise. Otherwise null (a
 * real external/other link, left alone).
 */
export function internalRouteForHref(href: string): string[] | null {
  const anchor = href.match(/^#([a-z-]+)$/i);
  if (anchor && personaById(anchor[1])) return [anchor[1]];

  const clean = href.replace(/^\.?\//, '');
  const [folder, file] = clean.split('/');
  const persona = PERSONA_CATALOG.find((p) => p.sourceFolder.replace(/\/$/, '') === folder);
  if (!persona) return null;
  if (!file || file === 'README.md') return [persona.id];
  const topicId = topicIdForFilename(persona.id, file);
  return topicId ? [persona.id, topicId] : [persona.id];
}
