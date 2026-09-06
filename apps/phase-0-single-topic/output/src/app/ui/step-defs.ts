import { SessionStore } from '../core/session-store';
import { IconName } from './icon-registry';

/**
 * layout.three-panel micro.reusable-template — Panel 1 (StepNav) and Panel 3
 * (StepGuide) both render from this one list; nothing about them is hard-coded
 * per step. Future phases add entries here without restructuring.
 *
 * `done` is display state only. The actual gate lives in core/step-guards.ts
 * (gating.linear-sequential) and is unchanged.
 */
export interface StepDef {
  n: number;
  path: string;
  label: string;
  icon: IconName;
  /** Panel 3 guide — one plain-language paragraph. */
  guide: string;
  done: (s: SessionStore) => boolean;
}

export const STEP_DEFS: StepDef[] = [
  {
    n: 0,
    path: 'intro',
    label: 'Introduction',
    icon: 'icon-story',
    guide:
      'One source, many readers. The same topic rarely lands the same way for two different readers — refraction rewrites it for each without changing the facts.',
    done: (s) => s.hasTopic()
  },
  {
    n: 1,
    path: 'topic',
    label: 'Topic',
    icon: 'icon-document',
    guide:
      'This is the raw material. Everything the readers see later is derived only from what you paste here — no outside facts are added — so include everything that matters.',
    done: (s) => s.hasTopic()
  },
  {
    n: 2,
    path: 'sources',
    label: 'Sources',
    icon: 'icon-source-files',
    guide:
      'Naming where the topic comes from and what it covers gives the refraction something to anchor to, and gives a reader a way to check the output back against the original.',
    done: (s) => s.hasSources()
  },
  {
    n: 3,
    path: 'personas',
    label: 'Personas',
    icon: 'icon-group',
    guide:
      'A persona is one reader with one set of priorities. The dimensions you pick decide what the refraction bends — format, depth, framing, reading time, or how much evidence it shows.',
    done: (s) => s.hasPersonas()
  },
  {
    n: 4,
    path: 'refract',
    label: 'Refract',
    icon: 'icon-nodes',
    guide:
      'Each persona gets its own pass over the same topic text. The outputs should read differently because the readers differ — not because any facts changed. Claims that cannot be traced back to the topic or sources are flagged here.',
    done: (s) => s.hasRefractions()
  },
  {
    n: 5,
    path: 'publish',
    label: 'Publish',
    icon: 'icon-save-to',
    guide:
      'Delivery is a plain request/response: choose a persona, get that persona’s version back. Nothing is stored — it resolves against this session only.',
    done: () => false
  }
];

export const STEP_BY_PATH: Record<string, StepDef> = Object.fromEntries(
  STEP_DEFS.map((d) => [d.path, d])
);
