# Build report — reader-app

Full rebuild from `apps/reader-app/specs/` per `apps/shared/BUILD_INSTRUCTIONS.md`.
`output/` was deleted and regenerated — the rewritten spec (real URL routing, a
persistent fixed nav panel, a recursive tree, order-prefix handling) shares no
code with the previous "no-router folder browser" design.

## Components built (all new)

| Component | Source |
|---|---|
| `content-browser.yaml` | `scripts/build-manifest.mjs`, `src/app/core/content-tree.ts` (pure), `src/app/core/content-browser.ts` |
| `view-state.yaml` | `src/app/state/view-state.ts` |
| `navigation-routing.yaml` | `src/app/app.routes.ts`, `src/app/app.ts` (URL → state) |
| `delivery.yaml` | `src/app/core/delivery.ts` |
| `layout-shell.yaml` | `src/app/app.ts` |
| `ui-edge-cases.yaml` | across `app.ts`, `nav-panel.ts`, `persona-topics.ts`, `schema-tree.ts`, `content-pane.ts`, `markdown.ts`, `view-state.ts` |
| `style-visual-theme.yaml` | `src/styles.css`, `src/app/ui/*` (Catenator tokens + one SVG mark, inline) |
| `branding-rename.yaml` | `src/app/brand/brand.ts` |

## Deviations / notes

1. **`.md` / `.yaml` dropped from route URLs.** `navigation-routing.yaml`
   micro.`url-mirrors-real-path` says the URL segment must match the real name
   "order-prefix included". But `navigation-routing.yaml` micro.`direct-load-works`
   requires a bookmarked URL to load directly, and the Angular dev-server (and
   typical static hosts) 404 any path with a file extension before SPA fallback
   can fire — verified: `/personas/engineers/refraction.md` → 404,
   `/personas/engineers/refraction` → 200. Resolution: the URL keeps every folder
   name **and the order prefix** (`/schema/3-views/3.1-interface`), dropping only
   the trailing type extension. `content-tree.ts` `urlSegmentFor()` /
   `resolveNode()` map a stemmed segment back to the real file. This favours the
   higher-consequence rule (direct-load-works) over the literal wording of
   url-mirrors-real-path; flagged here rather than resolved silently.
2. **`docs/` was restructured by the spec author**: `docs/content/` → `docs/personas/`,
   `docs/schemas/` → `docs/schema/`. The manifest scans exactly the two roots in
   `build-config.yaml`'s `contentSource.roots`.
3. `src/assets/content/` is gitignored (generated from `docs/`).
4. `docs/schema/` is currently only one level deep, but the tree walk and render
   are fully recursive (verified against the `{name,type,children}` shape in the
   test) — a nested folder would render without any code change.

## mustNever / micro verification

### system.yaml

| Rule | How satisfied |
|---|---|
| mustNever: generate / author / edit content | no write path; `deliver()` only `fetch`es a static asset. |
| mustNever: nav panel anywhere but fixed left, always visible | `app.ts` `.left-panel { position: fixed; left: 0; height: 100vh }`; content pane has `margin-left` equal to the panel width. |
| mustNever: hardcode a persona/topic/filename/depth | every label comes from `manifest.json`; `branding.test.mjs` asserts no folder-name literal (`tech-writers`, `3-views`, …) in `src/`. |
| mustNever: show persona topics AND the schema tree together | `nav-panel.ts` `@switch (state.mode())` renders exactly one. |

### content-browser.yaml

| Rule | How satisfied |
|---|---|
| mustNever: hardcode name/filename/depth | manifest-driven; `build-manifest.mjs` `walk()` recurses with the same file/folder check at every level. Test `every tree node is {name,type}, folders recurse`. |
| mustNever: hardcode a root's navigationMode | `RootConfig.navigationMode` from the manifest; `nav-panel` switches the dropdown vs `<app-schema-tree>` on `mode`, and `mode` is set from the URL root, not a name check. |
| mustNever: hardcode a source root path | `RootConfig.path` + `resolveUrl()`. |
| mustNever: display an order prefix | `displayName()` strips `^\d+(?:\.\d+)*[-.\s]+`. Test + screenshot (`3.1-interface.md` shows as `interface.md`). |
| micro.recursive-not-fixed-depth | `resolveNode()` / `walk()` check `type` per entry, no depth assumption. Test `resolveNode matches by stem, returns real path`. |
| micro.strip-order-prefix-for-display | `displayName()`; full name kept for URL (`urlSegmentFor`) and sort. |
| micro.numeric-sort-by-order-prefix | `orderSort()`; test `2 before 10, 3.1 before 3.2, unprefixed last`. |
| micro.full-markdown-rendering | `markdown.ts` pipe-table parser → `<table>`. Test + verified in-browser on `schema/3-views/3.1-interface` (bordered HTML table). |
| micro.scan-at-build-or-load | build time (`build-manifest.mjs`). |

### view-state.yaml

| Rule | How satisfied |
|---|---|
| mustNever: persona topics + schema tree at once | `mode` is one value; panel lower section renders on `mode` alone. |
| mustNever: stale active state after switching | `applyRoute()` fully rebuilds `mode`/`selectedPersona`/`selectedSegments` every navigation. Verified: Schema-docs → dropdown `value===''`; persona → Schema-docs not `.active`. |
| mustNever: open file/folder unmarked | `isActivePath()` + `isAncestorOfOpen()`; verified `.row.file.active` and `.row.folder.ancestor` both present. |
| micro.mutual-exclusivity | as above. |
| micro.bidirectional-reset | verified both directions in-browser. |
| micro.active-state-highlighting | dropdown shows the persona; open file filled; ancestor folders accented + auto-expanded (`autoExpand`). |

### navigation-routing.yaml

| Rule | How satisfied |
|---|---|
| mustNever: intercept markdown `<a>` tags for navigation | `markdown.ts` renders links as plain `<a>`; nothing listens for clicks on rendered content. Routes are set only by `nav-panel` / tree / topic-list controls. |
| mustNever: route structure not mirroring the folder path | routes are the real folder path (order prefixes kept); only the file extension is dropped — see Deviation 1. |
| routes /, /personas/:folder, /personas/:folder/:file, /schema/:path* | one catch-all route + `applyRoute()` parsing; arbitrary schema depth. |
| micro.url-mirrors-real-path | order prefixes in the URL; folders verbatim. |
| micro.direct-load-works | verified: direct load of `/schema/3-views/3.1-interface` → mode schema, tree expanded to the active file, content + page title correct. |
| micro.not-found-on-invalid-path | `/schema/nope/missing` → "Not found" pane (checked live against the manifest). |

### delivery.yaml

| Rule | How satisfied |
|---|---|
| mustNever: return content other than the route's | fetch URL is `resolveUrl(rootId, realPath)` from the resolved node only. |
| mustNever: blank result for a missing file without an explicit not-found | missing node, non-file node, or fetch failure → `{type:'not-found', path}`. Tests cover all three. |
| micro.explicit-not-found | `ContentPane` renders the not-found state with the offending path. |

### layout-shell.yaml

| Rule | How satisfied |
|---|---|
| mustNever: panel scrolls with page / moves / disappears above mobile bp | `position: fixed`; `.nav-inner` has its own `overflow-y`. |
| mustNever: panel width changes with content | fixed `width: 264px`. |
| micro.left-panel-is-fixed / content-pane-scrolls-independently | `.content-pane { margin-left: 264px; overflow-y: auto }`. |
| micro.mobile-handoff | one `@media (max-width: 768px)` block; the panel translates off-canvas behind `.nav-toggle`. |

### ui-edge-cases.yaml

| Rule | How satisfied |
|---|---|
| mustNever: blank/frozen pane while fetching | `ContentPane` shows `Loading…` (`role="status"`) on `state.loading()`. |
| mustNever: static tab title | `Title.setTitle(pageTitle(...))` per route; verified `refraction.md — engineers — Catenator Reader`. |
| mustNever: div-based nav controls | `<select>`, `<ul role="tree">` with `aria-expanded`, `<button>` rows. |
| mustNever: navigate away on an external markdown link | `markdown.ts` adds `target="_blank" rel="noopener"` to `http(s)` links; internal links untouched. Test. |
| micro.loading-state / dynamic-page-title / empty-folder-message | "No topics yet" in `persona-topics` / `schema-tree`. |
| micro.semantic-accessible-controls | as above. |
| micro.mobile-collapsible-nav (768px, one value) | `branding.test.mjs` asserts `768` appears in exactly one file (`app.ts`). |
| micro.external-links-new-tab | as above. |

### style-visual-theme.yaml / branding-rename.yaml

| Rule | How satisfied |
|---|---|
| style: no runtime dependency on the reference app | tokens + mark inline in `src/`. |
| style: no new icon/markdown library | hand-rolled `markdown.ts`. |
| branding: product name a literal in one file | `brand.ts` only; test. |
| branding: no retired name in the built app | `PRIOR_NAMES` scan; none. |

## Favicon (apps/shared/BUILD_INSTRUCTIONS.md standing rule)

`apps/shared/assets/favicon/*` → `src/assets/favicon/`; the four link tags in
`src/index.html`; `angular.json` serves `src/assets`.

## Verification run

- `npm test` — 18 / 18 pass (Node 22).
- `npm run build` (production) — clean, initial bundle 245 kB.
- In-browser, driven by clicks + direct loads (CDP):
  - `/` → README, Home/dropdown/Schema-docs present, lower section empty.
  - dropdown → `engineers` → `/personas/engineers`, topic list, Schema-docs not active.
  - topic → `/personas/engineers/refraction`, content, title updates, topic marked.
  - Schema docs → dropdown resets to unselected, tree replaces topics.
  - expand a folder, open a file → GFM table renders, file + ancestor folder marked.
  - direct load `/schema/3-views/3.1-interface` → identical state (mode, tree, content, title).
  - `/schema/nope/missing` → "Not found" pane.
  - favicon shows in the tab.
