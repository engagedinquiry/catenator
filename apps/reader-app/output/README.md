# Catenator Reader — Browse by persona, or view the schema

A read-only site for browsing pre-authored content under `docs/`:
`docs/personas/` (per-audience documentation, via a **dropdown**) and
`docs/schema/` (the Catenator standard, via an **expandable tree**). One
persistent, fixed left nav panel — Home, a "Reading as" dropdown, and a "Schema
docs" button, always visible; the persona topic list and the schema tree are
mutually exclusive below them. Real bookmarkable URLs mirroring the folder path.
Nothing is generated, authored, or edited.

Built from `apps/reader-app/specs/` per `apps/shared/BUILD_INSTRUCTIONS.md`.

## Run

```
npm install
npm start        # dev server on http://localhost:4200 (runs build:manifest first)
npm test         # 18 assertions
npm run build
```

`npm run build:manifest` (a `pre` step of start/build/test) walks `docs/personas/`
and `docs/schema/` recursively and writes `src/assets/content/manifest.json` plus
a copy of every file. Re-run it after changing anything under `docs/`.

## URLs

| URL | Shows |
|---|---|
| `/` | `docs/README.md`; dropdown and Schema-docs both unselected |
| `/personas/<folder>` | that persona's topic list (content pane prompts for a topic) |
| `/personas/<folder>/<topic>` | that topic's rendered content |
| `/schema/<seg>/<seg>/…` | the tree drilled to that path — a folder expands it, a file renders it |

The URL keeps the real folder names **and order prefixes** (`/schema/3-views/3.1-interface`)
but drops the trailing file-type extension, so a bookmarked link never 404s on a
static host. Sorting is numeric by the order prefix.

**Displayed titles come from each markdown file's first `# H1`** (nav entry and
browser tab), falling back to the order-stripped filename only when a file has no
H1. Selecting a persona renders that persona's `README.md` immediately — the
topic list and the content appear together, with no "pick a topic" step.

## Spec → code

| Component | Implementation |
|---|---|
| `content-browser.yaml` | `scripts/build-manifest.mjs` (recursive scan) + `core/content-tree.ts` (pure: strip/sort/resolve) + `core/content-browser.ts` |
| `view-state.yaml` | `state/view-state.ts` — `mode: none│persona│schema`, driven only by the URL |
| `navigation-routing.yaml` | `app.routes.ts` (one catch-all) + `App` watching `router.url` → `applyRoute()` |
| `delivery.yaml` | `core/delivery.ts` — `deliver(rootId, segments)` → content │ `{type:'not-found'}` |
| `layout-shell.yaml` | `app.ts` — `position: fixed` left panel, independently-scrolling content pane |
| `ui-edge-cases.yaml` | loading state, `Title` per page, "No topics yet", real `<select>`/`<ul>` tree, 768px collapsible nav, `target=_blank` for external links |
| `style-visual-theme.yaml` | `styles.css` + `ui/*` — Catenator design system, selected = filled |
| `branding-rename.yaml` | `brand/brand.ts` — single product-name literal; `<title>` composed per page |

See `BUILD_REPORT.md` for the per-component mustNever / micro verification.
