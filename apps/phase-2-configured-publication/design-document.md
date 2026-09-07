# Design document — Phase 2: Configured publication

## What this is

This is the progressive next step from `apps/phase-1-basic-publication`. The major change: not every topic is refracted for every persona. By default, a topic is refracted for all personas, unless configured with `exclude-for` (refract for all personas except the listed ones) or `only-for` (refract only for the listed personas) — a topic may set one or the other, never both. Setting both on the same topic is a Quality Check failure, not something resolved silently by picking a winner.

This phase also introduces **Shared Blocks** at the publication level — reusable content fragments a topic can reference, rather than repeating the same text across multiple topics.

## Layout

Inherited from Phase 1 unchanged: the same three-panel layout, the same reusable markdown/YAML editor component, the same Panel 1 accordion pattern — extended with the additions below, not redesigned.

### Panel 1 — Accordion navigation

Same sections as Phase 1 (Publication, Topics, Variables, Sources, Personas), plus:

- **Shared Blocks** — the list of reusable content fragments, with an action to add a new block. Each block has a name and content, editable the same way a Topic's content is (Metadata / Editor / Preview).
- **Topics** — unchanged structurally from Phase 1, with one addition: each topic's metadata now includes an optional `exclude-for` or `only-for` persona list (mutually exclusive, per the rule above).

### Panel 2 — the editor

Unchanged from Phase 1's generic behavior. Shared Blocks open using the same Topic-style editor (Metadata / Editor / Preview), since block content is markdown, not structured metadata.

### Panel 3 — Guide and Quality Check

**Guide** — unchanged behavior (static, selection-type-driven text), with two new selection types covered: Shared Blocks, and a topic's persona-visibility settings.

**Quality Check** — the four checks from Phase 1, plus:
- A topic setting both `exclude-for` and `only-for` simultaneously fails Quality Check.
- Any persona listed in a topic's `exclude-for` or `only-for` must actually exist in the publication's Personas list.
- Any Shared Block referenced by a topic must actually exist in the publication's Shared Blocks list.

## Technology

Angular frontend.
