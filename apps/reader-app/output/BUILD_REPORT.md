# Build report — reader-app

Built from `apps/reader-app/specs/` per `apps/shared/BUILD_INSTRUCTIONS.md`.

## Components built

| Component | Status | Source |
|---|---|---|
| `persona-catalog.yaml` | built new | `src/app/core/persona-catalog.ts` |
| `content-source.yaml` | built new | `src/app/core/content-source.ts` |
| `delivery-request-response.yaml` | built new | `src/app/core/delivery.ts` + `src/app/state/reader-store.ts` |
| `style-visual-theme.yaml` | built new, **reusing Phase 0's design system** | `src/styles.css`, `src/app/ui/*` — token values copied from `apps/phase-0-single-topic/output/src/styles.css` (itself the committed result of the syntaxia-studio reference inspection). No runtime dependency on any reference app. |
| `branding-rename.yaml` | **spec file absent** from `apps/reader-app/specs/components/`; `system.yaml` still references it. Phase 0's `brand.ts` pattern applied. | `src/app/brand/brand.ts` |
| `layout-reader-shell.yaml` | built new (component update) | `src/app/pages/persona-page.ts` + `src/app/ui/{persona-switcher,topic-list,content-pane}.ts` |
| `navigation-routes.yaml` | built new (component update) | `src/app/app.routes.ts` + `src/app/pages/home-page.ts` + `src/app/core/content-source.ts` (`internalRouteForHref`, `topicIdForFilename`) |

### Component update — 2026-09-06

`RUN.md` scoped a second run to
`COMPONENTS = ["components/layout-reader-shell.yaml", "components/navigation-routes.yaml"]`.
Both introduced structure the first build had guessed at:

- **layout.reader-shell** replaced the left-sidebar persona *buttons* with a
  single `<select>` dropdown in a full-width top bar, and pinned the topic list
  to a fixed 232 px left column (`persona-page.ts` `.topic-panel`:
  `flex: 0 0 232px`, unaffected by content or height).
- **navigation.routes** turned persona and topic into real URL segments
  (`/`, `/:personaId`, `/:personaId/:topicId`), made `/` render `docs/README.md`
  itself as the landing "which one is you?" router, and made its persona links
  route internally instead of dead-linking to raw `.md` files. `ReaderStore`
  became route-driven (`setRoute()`); `ReaderPage` was deleted in favour of
  `HomePage` + `PersonaPage`.

## Deviations from spec / config (all in one place)

1. **`prompts/build-config,yaml` → `prompts/build-config.yaml`** — the file had a
   comma where `RUN.md` and its own text expect a dot. Renamed.
2. **`content-source.yaml` `standardReference.path: "schema/"`** — that folder was
   renamed to `schemas/` in the docs restructure. `content-source.ts` uses
   `schemas/`; still a single value joined onto the content root.
3. **`contentSource.rootDir: "docs"`** is repo-relative and unreadable from a
   browser. `scripts/sync-content.mjs` mirrors it into `src/assets/content/`;
   `CONTENT_ROOT` in `build-config.ts` is the one place that path is named.
4. **`branding-rename.yaml`** — not present (see table above).
5. **`docs/README.md`'s logo banner** — the file opens with a raw
   `<p align><img src="../brand/logo.png"></p>` block. `renderMarkdown()` drops
   standalone block-level HTML tags (`<p>`, `<img>`, …); markdown `![alt](src)`
   image syntax still renders. The app has its own brand mark in the rail.

## mustNever / micro verification

### system.yaml

| Rule | How satisfied |
|---|---|
| mustNever: Generate or modify content | No write path anywhere. `deliver()` only `fetch`es a static asset URL and returns its text. No AI transport, no editor. |
| mustNever: Infer a persona for the reader | `ReaderStore.personaId` starts `null`; only `selectPersona()` (an explicit button click) sets it. `deliver()` returns `no-persona-selected` when it is `null`. |
| mustNever: Track the reader's choice across sessions | State is Angular signals only — no `localStorage`, no cookies, no disk. A reload restarts persona-less. Test: *catalog / delivery* suites construct fresh state each run. |
| contentScope: read schema reference folder | `/standard` route → `StandardPage` fetches `assets/content/schemas/catenator-standard.md`. |
| contentScope: switch between the six personas | `PERSONA_CATALOG` = the six; `PersonaSwitcher` renders all six, one selectable at a time. |
| excluded: authoring / new persona / live refraction | None implemented; no UI affordance exists for any of them. |

### persona-catalog.yaml

| Rule | How satisfied |
|---|---|
| mustNever: invent a persona not backed by a folder | List is literal and matches the six folders under `docs/`. Test `catalog: exactly the six fixed personas`. |
| mustNever: let the reader add a custom persona | `PERSONA_CATALOG` is `readonly`; no add UI. |
| mustNever: hardcode the source root path | Every `sourceFolder` is relative and only ever passed through `resolveContentPath()`. Test `catalog: every sourceFolder is relative, never absolute`. |
| micro.fixed-list-only | List is a module constant, not a runtime scan of the content dir. |
| micro.relative-to-config | `resolveContentPath()` joins onto `CONTENT_ROOT`; changing it needs no edit here. Test `catalog: sourceFolder resolves under the single content root`. |

### content-source.yaml

| Rule | How satisfied |
|---|---|
| mustNever: show a persona a file from another persona's folder | `fileFor()` joins `persona.sourceFolder` with that persona's own filename entry only. Test `content-source: fileFor stays inside the requested persona folder`. |
| mustNever: treat the schema folder as per-persona | `STANDARD_REFERENCE` is a single path; not in `TOPIC_MAP`; rendered by its own route. Test `content-source: the standard reference is one persona-invariant path`. |
| mustNever: fail silently on a missing file | `null` map entry → `{available:false}` → `not-available-for-persona` message in the pane. A listed-but-unfetchable file → `not-found` message. Tests `delivery: null pair …` and `delivery: listed file that fails to load …`. |
| mustNever: hardcode a source root path | All paths via `resolveContentPath()`. |
| micro.null-means-unavailable | `TopicList` shows the row with a "Not covered" tag, non-clickable; `ContentPane` shows a worded message. |
| micro.relative-to-config | As above — `CONTENT_ROOT` is the only path literal. |
| micro.topic-persists-across-persona-switch | `selectPersona()` never touches `topicId`. Test `delivery: topic persists across persona switch`; confirmed visually (Engineers→Governing docs keeps "Start here"). |

### delivery-request-response.yaml

| Rule | How satisfied |
|---|---|
| mustNever: return content for a different pair | The fetched URL comes solely from `fileFor(topicId, personaId)`. Test `delivery: returns exactly the requested persona/topic file`. |
| mustNever: guess a persona if none chosen | `personaId === null` → `no-persona-selected` before any fetch. Test `delivery: no persona chosen …`. |
| contractShape input/output/errorOutput | `DeliveryRequest {topicId, personaId}` → `DeliveryResponse` union: `content` \| `no-persona-selected` \| `not-available-for-persona` \| `not-found`. |
| micro.both-explicit | `PersonaSwitcher` and `TopicList` are two always-visible, independent controls. Neither implies the other. |
| micro.default-on-load | `ReaderStore` initialises `topicId='start'`, `personaId=null`; `ReaderPage.ngOnInit` loads once. Generic framing shows for `start` pre-persona. |

### style-visual-theme.yaml

| Rule | How satisfied |
|---|---|
| mustNever: change content/catalog/delivery logic in the styling pass | Styling lives in `styles.css` + component `styles:` blocks only. |
| mustNever: live dependency on the reference app | All token values and SVG marks are inline in this repo. `icon-registry.ts` carries the marks. |
| mustNever: new icon library without checking the reference | syntaxia-studio ships no icon library and no markdown library — none added. Markdown is a ~120-line hand-rolled renderer (`core/markdown.ts`). |
| mustNever: apply Phase 0 step-state rules here | No step-nav; `selected` (filled bg) is the only stateful treatment, on the persona switcher. |
| micro.report-before-applying | This section. Reference approach: global stylesheet + CSS custom properties, no framework, custom SVG icons. |
| micro.apply-to-reader-ui-elements | Persona switcher, topic list, content pane are the styled surfaces; selected persona = filled accent background (Phase 0's "done" treatment adapted). |
| micro.standalone-styling | Committed into `src/`; nothing loads from the reference app at runtime. |

### branding-rename.yaml (spec absent — Phase 0 pattern applied)

| Rule | How satisfied |
|---|---|
| mustNever: hardcode a product name | `BRAND.productName` is the sole literal, in `brand/brand.ts`, mirroring `build-config.yaml`. Test `branding: product name … present once as a literal`. |
| mustNever: leave a prior name in the UI | `PRIOR_NAMES = ['Syntaxia','Syntaxia Studio']`; test `branding: no retired Catenator-family name appears in source` scans all `src/**/*.{ts,html,css}`. |

### layout-reader-shell.yaml

| Rule | How satisfied |
|---|---|
| mustNever: topic list panel grows/shrinks with height or content | `.topic-panel` is `flex: 0 0 232px` with matching `min/max-width`; nothing in its rules keys off content. Verified in-browser across topics with very different content lengths. |
| mustNever: topic list / persona switcher on the right | `.top-bar` is `flex-direction: row` with branding first; `.topic-panel` is the first flex child of `.body` (left). The persona dropdown is the one element allowed right (`.tb-spacer` pushes it), per `micro.no-right-alignment`. |
| mustNever: persona switcher as buttons / radios | `PersonaSwitcher` is a single `<select>` with six `<option>`s. |
| micro.persona-switcher-is-dropdown | `<select>`; `change` navigates to `/:personaId/:currentTopicId`, updating the pane. |
| micro.fixed-topic-list-width | Width is the constant `232px`, set once on `.topic-panel`. |
| micro.no-right-alignment | Only the persona dropdown sits right, inside the top bar. |

### navigation-routes.yaml

| Rule | How satisfied |
|---|---|
| mustNever: land directly in a persona/topic view on first load | `/` → `HomePage`, which shows no persona content. `/:personaId` etc. are separate routes. |
| mustNever: README persona links as dead links to raw `.md` | `HomePage.onClick` runs every anchor through `internalRouteForHref()`; a hit calls `preventDefault()` + `router.navigate()`. Verified: clicking "Engineers" on `/` → `/engineers`. Tests `navigation: README folder link -> internal persona route`, `… "#personaId" anchor …`. |
| mustNever: duplicate README content by hand | `HomePage` fetches `assets/content/README.md` and renders it through the same `renderMarkdown()` used for topics. |
| routes: `/`, `/:personaId`, `/:personaId/:topicId` | `app.routes.ts`. `/standard` is listed before `:personaId` so the literal wins. |
| micro.home-link-interception | `internalRouteForHref()` maps `<folder>/<file>` (folder ∈ persona catalog) and `#<personaId>` to route segments; `topicIdForFilename()` resolves the file per-persona. |
| micro.browser-navigable | All three levels are real routes; dev-server SPA fallback verified (`/governing-docs/refraction` deep-links to the right persona + topic + content). |
| micro.layout-applies-below-home | `PersonaPage` carries the shell; `HomePage` is single-column (`.home-wrap`). |

## Favicon (apps/shared/BUILD_INSTRUCTIONS.md standing rule)

`apps/shared/assets/favicon/*` copied to `src/assets/favicon/`; the four link
tags are in `src/index.html`; `angular.json` serves `src/assets`. Verified served
(`/assets/favicon/favicon.ico` → 200 `image/x-icon`).

## Verification run (after the component update)

- `npm test` — 28 / 28 pass (Node 22).
- `npm run build` (production) — clean, initial bundle 246 kB.
- Served build, screenshotted / driven via CDP:
  - `/` renders `docs/README.md`; clicking "Engineers" → `/engineers` (internal
    route, not the raw `.md`), dropdown then reads "Engineers".
  - `/engineers` — top-bar dropdown, fixed 232 px topic list, README in the pane.
  - `/governing-docs/refraction` deep-link — right persona + topic + content;
    "Governing document" and "Mechanics of refraction" show **Not covered**.
  - `/standard` — frontmatter stripped, TOC rendered.
  - Favicon shows in the tab.
