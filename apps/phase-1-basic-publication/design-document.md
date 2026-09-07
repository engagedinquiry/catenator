# Design document — Phase 1: Basic publication

## What this is

This is the progressive next step from `apps/phase-0-single-topic`. The major change: in place of a single topic, the user works with a **publication** built from multiple topics, arranged in a hierarchy of arbitrary depth — depth is not fixed or assumed; it depends entirely on what the publication actually needs.

Similar to the phase-0 app, the publication has sources. By default, every source is available to every topic; a topic's own metadata can identify which sources it prefers, overriding the default set for that topic specifically.

Persona definitions live at the **publication** level, not per-topic — one shared set of personas governs refraction across every topic in the publication.

Publication-level configuration includes:
- The topic outline (the publication's structure)
- Sources
- Personas

Refraction is triggered at the publication level, in one action, and refracts every topic in the publication — not one topic at a time.

Reference: `C:\Users\parth\ei\eisyntaxia_repos\playground\syntaxia-playground`

## Layout

Following the pattern of the referenced workspace, the app layout is three panels (excluding the left icon bar with the logo, which is unchanged from that reference and from phase-0).

## Markdown and YAML form, editor, and preview

A core, reusable component — built with whatever library the system configuration specifies — lets the user edit a markdown or YAML file, using a form or an editor, with a Preview available wherever it's meaningful (markdown). Where Preview wouldn't render anything meaningful (YAML, structured metadata), the Preview button is not displayed at all.

### Panel 1 — Accordion navigation

Accordion sections, each showing:

- **Publication** — display name. Clicking opens the publication's metadata editor in Panel 2.
- **Topics** — the list of topics, with an action to add a new topic. Each topic item shows its name and action buttons: add a child topic, delete this topic, move up, move down. "Move up/down" reorders among siblings only — it does not promote or demote a topic to a different parent. There is no depth limit; a topic can have children, which can have children, following whatever hierarchy the publication actually needs.
- **Variables** — metadata.
- **Sources** — metadata.
- **Personas** — metadata.

### Panel 2 — the editor, generic across everything selectable in Panel 1

Whatever is currently selected in Panel 1 (a topic, Publication metadata, a Variable, a Source, a Persona) opens in Panel 2 using the shared markdown/YAML editor component:

- **Publication metadata, Variables, Sources, Personas** — these are structured data (name/value pairs, or small metadata objects), not prose — so they render as a **form**, not a markdown editor. No Preview tab for any of them.
- **Topics** — these are the actual markdown content — Metadata / Editor / Preview tabs, matching the reference exactly.
- Selecting nothing (fresh load) shows the Publication metadata form by default, since that's the top-level entry point.

### Panel 3 — Guide and Quality Check

Both present, for this phase, as follows:

- **Guide tab** — instructional text, static per selection type. Whatever's currently selected in Panel 1 (Publication metadata, a Topic, Variables, Sources, Personas) determines which fixed guide content is shown — five pre-written blocks, one per type. This content is not generated and does not react to the actual content being edited, in this phase.

  A future phase may make Guide content responsive to the actual content being worked on — for example, flagging an undefined variable inline as the user types, rather than only failing Quality Check afterward. That is explicitly out of scope for this phase; the Guide here is static, selection-type-driven text only.

- **Quality Check tab** — runs four checks against the publication:
  - Every topic has required metadata filled in (at minimum: a name).
  - Every source reference used by a topic resolves to a real source in the publication's source list.
  - Every `{{variable}}` referenced inside a topic's content is defined in the publication's Variables list.
  - At least one persona exists before refraction is allowed to run.

## Technology

Angular frontend.