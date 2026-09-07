import { SessionStore } from '../core/session-store';

/**
 * layout.three-panel micro.reusable-template: Panel 1 (step-nav) and Panel 3
 * (step-guide) BOTH read from this one list. Nothing about a step is hard-coded
 * in either panel component.
 *
 * deployedProcess.steps = [Introduction, Topic, Sources, Personas, Refract, Publish]
 * numbered 0-5 (style.visual-theme.no-icons-on-step-numbers keeps the number the
 * primary identifier).
 */
export interface StepDef {
  n: number;
  path: string;
  label: string;
  /** Panel 3 plain-language guide for this step. */
  guide: string;
  /** true once this step's own required data is captured. */
  done: (s: SessionStore) => boolean;
}

export const STEP_DEFS: StepDef[] = [
  {
    n: 0,
    path: 'intro',
    label: 'Introduction',
    guide: 'What this lab is and what you will have at the end. No data is entered here.',
    done: () => true
  },
  {
    n: 1,
    path: 'topic',
    label: 'Topic',
    guide:
      'Paste one conceptual topic as plain text. This is the only source of facts for every refraction — there is exactly one topic per lab.',
    done: (s) => s.hasTopic()
  },
  {
    n: 2,
    path: 'sources',
    label: 'Sources',
    guide:
      'Ground the topic with one reference record: a title, where it comes from, and a description. Enter it as a form or as markdown (## Title / ## Source / ## Description) — both produce the same data.',
    done: (s) => s.hasSources()
  },
  {
    n: 3,
    path: 'personas',
    label: 'Personas',
    guide:
      'Name up to two readers. Each has a summary and any of the five fixed dimensions (Surface, Content, Context, Time, Trust). Form or markdown (## <name>, a summary paragraph, then a comma-separated dimension line).',
    done: (s) => s.hasPersonas()
  },
  {
    n: 4,
    path: 'refract',
    label: 'Refract',
    guide:
      'One action refracts the topic for every persona at once, via your own model provider. A missing API key blocks only this step.',
    done: (s) => s.allRefracted()
  },
  {
    n: 5,
    path: 'publish',
    label: 'Publish',
    guide:
      'A reader picks a persona and receives that reader\'s version. Every request is grounding-checked before it is served.',
    done: (s) => s.allRefracted()
  }
];

export const STEP_BY_PATH: Record<string, StepDef> = Object.fromEntries(
  STEP_DEFS.map((d) => [d.path, d])
);
