# Traceability — Phase 1 design document → spec

| Design document requirement | Satisfied by (component : rule id) |
|---|---|
| Publication metadata (display name, entry point) | `publication.metadata` : default-selection-on-load, form-not-markdown |
| Topics, arbitrary depth, add/delete/move-up/move-down (siblings only), add child | `topic.hierarchy` : recursive-not-fixed-depth, add-child-topic, move-reorders-siblings-only, delete-warns-about-children |
| Sources, publication-level, per-topic override | `source.with-override` : default-is-all-sources, override-references-real-sources-only |
| Personas, max 2, same shape as phase-0, positional id, five fixed dimensions | `persona.catalog` : max-two-personas, five-fixed-dimensions, persona-id-is-positional, publication-level-not-per-topic |
| Variables, publication-level, `{{name}}` substitution | `variable.substitution` : reference-syntax, form-not-markdown |
| No dialogs anywhere in this phase | `editor.generic` : no-dialogs-anywhere; `system.yaml` mustNever |
| Shared Blocks out of scope | `system.yaml` mustNever + contentScope.excluded; `layout.three-panel` : accordion-sections-fixed |
| Three-panel layout, Panel 1 accordion (5 sections) | `layout.three-panel` : accordion-sections-fixed |
| Panel 2 generic editor, form vs. markdown by selection type | `editor.generic` : renderModes |
| Panel 3 Guide, static, five blocks, one per type | `guide.static-per-selection` : five-fixed-blocks |
| Panel 3 Quality Check, four checks | `quality-check.four-checks` : all four `checks` entries |
| Refraction at publication level, one action, every topic × persona | `refraction.publication-level` : one-action-many-calls, resolved-sources-per-topic |
| Same grounding/failure behavior as phase-0's compiler | `refraction.publication-level` : same-failure-behavior-as-phase-0; mustNever (invent-a-value) |
| Small-screen notification (carried from phase-0) | `layout.three-panel` : narrow-viewport-notification |
| Branding from build-config, no leftover prior name | `branding.rename` (reused from phase-0, unchanged) |
| Visual style matches other Catenator apps | `style.visual-theme` : reuse-phase-0-tokens-first |
| Angular frontend | `build-config.yaml` techStack.frontend |

## Gaps found

None. Every design-document requirement maps to a specific,
self-checked component and rule.

## One deliberate design choice worth flagging, not a gap

`persona.catalog`'s `fixedDimensions` list is restated in this app's
own `system.yaml` rather than referencing phase-0-single-topic's file
directly — the two apps are separate deployable units with no shared
runtime, so cross-app file references aren't meaningful. Both lists
currently match by value (Surface, Content, Context, Time, Trust);
if phase-0's list is ever changed, this app's copy will not update
automatically and must be changed here too.
