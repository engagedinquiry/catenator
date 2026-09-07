# Catenator Reader — One idea, read your way

A **Delivery-only** app: it reads governed content that already exists and lets a
reader choose *which persona's version* to view, switching freely. No authoring,
no refraction generation, no AI model calls.

Built from `apps/reader-app/specs/` per `apps/shared/BUILD_INSTRUCTIONS.md`.
Everything is in-memory: every visit starts with no persona selected.

## Run

```
npm install
npm run sync:content   # mirror docs/ into src/assets/content/ (see below)
npm start              # dev server on http://localhost:4200
npm test               # 21 assertions over the deterministic core
npm run build
```

## Content

`build-config.yaml` → `contentSource.rootDir` is `docs` (repo-relative,
`mode: pre-authored`). The browser can't read the repo tree, so
`scripts/sync-content.mjs` copies the six persona folders plus the schema
reference folder into `src/assets/content/`, and
`src/app/core/build-config.ts` (`CONTENT_ROOT`) is the single place that path is
named. Re-run `npm run sync:content` after editing anything under `docs/`.

## Routes

| URL | Renders |
|---|---|
| `/` | `docs/README.md` itself — the "which one is you?" landing page. Its persona links route *into* the app (e.g. `[Engineers](engineers/README.md)` → `/engineers`), never to raw markdown. Single column, no persona selected. |
| `/:personaId` | That persona's topic list (fixed-width, left) + their `start` topic in the content pane. Top bar carries the branding and the persona **dropdown**. |
| `/:personaId/:topicId` | A specific topic for that persona. A topic with no file for that persona shows **Not covered**, never a blank page. |
| `/standard` | The Catenator standard itself — one canonical reference, identical for every persona. |

All routes are real, bookmarkable URLs. Switching persona in the dropdown keeps
the current topic (`/:newPersona/:sameTopic`). Nothing about the reader is
inferred — the persona in the URL is the only persona used.

## Spec → code map

| Component spec | Implementation |
|---|---|
| `persona-catalog.yaml` | `src/app/core/persona-catalog.ts` — the fixed six, literal list |
| `content-source.yaml` | `src/app/core/content-source.ts` — `TOPIC_MAP`, `fileFor()`, `STANDARD_REFERENCE` |
| `delivery-request-response.yaml` | `src/app/core/delivery.ts` — `deliver({topicId, personaId})` |
| `style-visual-theme.yaml` | `src/styles.css` + `src/app/ui/*` — Catenator design system, selected = filled |
| `layout-reader-shell.yaml` | `src/app/pages/persona-page.ts` — top bar + fixed-width topic list + content pane |
| `navigation-routes.yaml` | `src/app/app.routes.ts` + `src/app/pages/home-page.ts` + `content-source.ts` link resolution |
| `branding-rename.yaml` (not in this app's spec set; Phase 0 pattern applied) | `src/app/brand/brand.ts` — sole source of the product name |

See `BUILD_REPORT.md` for the per-component mustNever / micro verification.
