# Traceability — design document → spec

Every requirement in design-document.md, mapped to the component and
rule that satisfies it. If a row's "Satisfied by" column is empty or
vague, that's a real gap — not something to assume is covered.

| Design document requirement | Satisfied by (component : rule id) |
|---|---|
| Read-only, no generation/authoring/editing | `system.yaml` mustNever; `content.browser` intent |
| Two source folders: personas/, schema/ | `build-config.yaml` contentSource.roots |
| Left nav panel, fixed, full height, never top/bottom, never scrolls | `layout.shell` : left-panel-is-fixed |
| Content pane, scrolls independently | `layout.shell` : content-pane-scrolls-independently |
| Personas navigable via dropdown | `build-config.yaml` roots[personas].navigationMode; `content.browser` behavior |
| Schema navigable via expandable tree | `build-config.yaml` roots[schema].navigationMode; `content.browser` behavior |
| Order-prefix stripped for display, used for sort | `content.browser` : strip-order-prefix-for-display, numeric-sort-by-order-prefix |
| Home button always visible | `view.state` behavior (Home state); `layout.shell` structure.left-panel |
| Reading-as dropdown always visible | `view.state` navPanelState; `layout.shell` structure.left-panel |
| Schema docs button always visible | `view.state` navPanelState; `layout.shell` structure.left-panel |
| Selecting persona resets/hides schema state | `view.state` : bidirectional-reset |
| Clicking Schema docs resets dropdown | `view.state` : bidirectional-reset |
| Persona topics and schema tree never shown together | `view.state` : mutual-exclusivity |
| Home shows docs/README.md | `view.state` behavior (home state) |
| Active-state highlighting (current file + folder marked) | `view.state` : active-state-highlighting |
| Recursive depth, never assumed | `content.browser` : recursive-not-fixed-depth |
| Real URLs mirroring folder paths | `navigation.routing` routes, url-mirrors-real-path |
| Routing driven by UI controls, not link parsing | `navigation.routing` mustNever; system.yaml mustNever |
| Direct URL load reproduces correct state | `navigation.routing` : direct-load-works |
| Site keeps working if docs/ files change post-build | `navigation.routing` intent; `content.browser` : scan-at-build-or-load |
| GFM tables render as real `<table>` | `content.browser` : full-markdown-rendering |
| Not-found handling | `delivery.request-response` : explicit-not-found; `navigation.routing` : not-found-on-invalid-path |
| Loading state | `ui.edge-cases` : loading-state |
| Dynamic page title | `ui.edge-cases` : dynamic-page-title |
| Empty folder message | `ui.edge-cases` : empty-folder-message |
| Accessible, semantic controls | `ui.edge-cases` : semantic-accessible-controls |
| Mobile-collapsible nav | `ui.edge-cases` : mobile-collapsible-nav; `layout.shell` : mobile-handoff (768px, shared value) |
| External links open in new tab | `ui.edge-cases` : external-links-new-tab |
| Visual style matches other Catenator apps | `style.visual-theme` |
| App name/tagline from config, no leftover prior name | `branding.rename` |
| Angular frontend | `build-config.yaml` techStack.frontend |

## Gaps found by producing this table

None currently open. Every design-document requirement has at least
one specific component/rule citation. This table itself is the check
— if a future design-document change doesn't get a new row here, that
absence is the signal something wasn't actually specified yet.
