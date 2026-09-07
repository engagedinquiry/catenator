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

## What the reader does

| Control | Behaviour |
|---|---|
| **Persona switcher** (6 fixed options) | Pick one at a time. Nothing is inferred — the choice *is* the persona. Switching keeps the current topic. |
| **Topic list** (6 topics) | Always a separate selector. A topic with no file for the chosen persona shows **Not covered** and is non-selectable, never a blank page. |
| **The standard** (top bar) | The Catenator standard itself — one canonical reference, identical for every persona, not part of the persona switch. |

On first load: topic `start`, no persona — generic framing shows until a persona
is chosen.

## Spec → code map

| Component spec | Implementation |
|---|---|
| `persona-catalog.yaml` | `src/app/core/persona-catalog.ts` — the fixed six, literal list |
| `content-source.yaml` | `src/app/core/content-source.ts` — `TOPIC_MAP`, `fileFor()`, `STANDARD_REFERENCE` |
| `delivery-request-response.yaml` | `src/app/core/delivery.ts` — `deliver({topicId, personaId})` |
| `style-visual-theme.yaml` | `src/styles.css` + `src/app/ui/*` — Catenator design system, selected = filled |
| `branding-rename.yaml` (not in this app's spec set; Phase 0 pattern applied) | `src/app/brand/brand.ts` — sole source of the product name |

See `BUILD_REPORT.md` for the per-component mustNever / micro verification.
