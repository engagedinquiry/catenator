# Traceability — Phase 1 (Publication with topics) design document → spec

| Design document requirement | Satisfied by (component : rule id) |
|---|---|
| Publication is a fixed set of 5 topics, fixed order | `topic.fixed-set` : five-fixed-topics |
| Only topic content editable, not the topic list | `topic.fixed-set` : only-content-is-editable, mustNever |
| Sources fully editable, no cap | `source.catalog` : full-crud |
| Variables fully editable, no cap | `variable.catalog` : full-crud, reference-syntax |
| Personas fully editable, uncapped | `persona.catalog` : full-crud-uncapped, mustNever |
| Persona id positional | `persona.catalog` : persona-id-is-positional |
| Context expresses first-time vs. returning, not a new persona | `persona.catalog` : context-expresses-first-time-vs-returning |
| `source.onlyUse` — per-topic source subset | `topic.scoping` : source-only-use |
| `refraction.personas.onlyFor` / `excludeFor`, mutually exclusive | `topic.scoping` : refraction-personas-mutual-exclusivity |
| `refraction.surface/tones/styles` — parked | `topic.scoping` : parked-fields-not-built |
| `excludeFrom` — parked | `system.yaml` contentScope.excluded |
| Refraction at publication level, one action | `refraction.publication-level` : one-action-many-calls |
| Refraction respects per-topic persona scoping | `refraction.publication-level` : respects-persona-scoping |
| Same compiler failure behavior as Phase 0 | `refraction.publication-level` : same-failure-behavior-as-phase-0 |
| Three-panel layout, five accordion sections | `layout.three-panel` : accordion-sections-fixed |
| No modal dialogs anywhere | `editor.generic` : no-dialogs-anywhere; system.yaml mustNever |
| Panel 2 generic editor, form vs. markdown | `editor.generic` : renderModes |
| Panel 3 Guide, static, five blocks | `guide.static-per-selection` : five-fixed-blocks |
| Quality Check: metadata, source resolution, variable resolution, mutual exclusivity, persona exists | `quality-check.publication` : all five `checks` entries |
| Small-screen notification | `layout.three-panel` : narrow-viewport-notification |
| Branding from config, no leftover name | `branding.rename` (unchanged from phase-0) |
| Visual style matches other Catenator apps | `style.visual-theme` : reuse-phase-0-tokens-first |
| Fixture: 5 topics, 2 sources, 3 variables, 3 personas | `build-config.yaml` defaultFixture |
| Angular frontend | `build-config.yaml` techStack.frontend |

## Gaps found

None. Every design-document requirement maps to a specific,
self-checked component and rule.

## Superseded file, flagged for removal

The earlier `topic-hierarchy.yaml` (recursive, fully add/edit/delete/
reorder-editable topic tree) is superseded by `topic-fixed-set.yaml`
(fixed array of exactly 5, content-only editing) — a genuinely
different mechanism, not an edit of the old one. `topic-hierarchy.yaml`
should be deleted from the repo, not left sitting unreferenced.
