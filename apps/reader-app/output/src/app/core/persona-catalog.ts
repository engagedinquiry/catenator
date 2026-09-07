/**
 * persona.catalog — the fixed set of personas a reader can choose from.
 *
 * This is exactly the six audiences defined under build-config.yaml's
 * contentSource.rootDir. It is a literal list here, NOT derived by scanning the
 * content root at runtime (micro.fixed-list-only): adding a seventh persona is a
 * deliberate change to this file, not something the app discovers.
 *
 * `sourceFolder` values are relative to the content root (micro.relative-to-config)
 * — they are joined via resolveContentPath(), never used as absolute paths.
 */
export interface PersonaEntry {
  readonly id: string;
  readonly label: string;
  readonly sourceFolder: string;
}

export const PERSONA_CATALOG: readonly PersonaEntry[] = [
  { id: 'creators', label: 'Creators', sourceFolder: 'creators/' },
  { id: 'tech-writers', label: 'Tech writers', sourceFolder: 'tech-writers/' },
  { id: 'knowledge-teams', label: 'Knowledge teams', sourceFolder: 'knowledge-teams/' },
  { id: 'integrators', label: 'Integrators', sourceFolder: 'integrators/' },
  { id: 'engineers', label: 'Engineers', sourceFolder: 'engineers/' },
  { id: 'governing-docs', label: 'Governing docs', sourceFolder: 'governing-docs/' }
] as const;

export type PersonaId = (typeof PERSONA_CATALOG)[number]['id'];

export function personaById(id: string): PersonaEntry | undefined {
  return PERSONA_CATALOG.find((p) => p.id === id);
}
