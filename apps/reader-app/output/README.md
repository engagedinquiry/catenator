# Catenator Reader — Browse by persona, or view the schema

A **Delivery-only** app: it browses governed content that already exists. From
a home page you pick one of two roots — **browse by persona** (`docs/content/`)
or **view schema docs** (`docs/schema/`) — then a category (a subfolder), then a
file. One generic folder-browsing mechanism serves both roots.

**No routing.** Navigation is a single in-memory state variable, not a URL.
**Nothing is hardcoded** — every persona, section, and filename shown is read
from the actual folder/file names on disk.

Built from `apps/reader-app/specs/` per `apps/shared/BUILD_INSTRUCTIONS.md`.

## Run

```
npm install
npm start        # dev server on http://localhost:4200 (runs build:manifest first)
npm test         # 15 assertions
npm run build
```

`npm run build:manifest` (a `pre*` step of start/build/test) scans
`docs/content/` and `docs/schema/` and writes `src/assets/content/manifest.json`
plus a copy of every file. Re-run it after changing anything under `docs/`.

## The four states (`view.state`)

| State | Shows | Reached by |
|---|---|---|
| `home` | `docs/README.md` rendered, then two options | initial |
| `categoryList` | Subfolders of the chosen root | clicking an option |
| `fileList` | Files in the chosen subfolder + a sibling-category dropdown | clicking a category |
| `content` | The chosen file (GFM, incl. tables) + the same dropdown | clicking a file |

The `docs/README.md` on home, the persona folders, and the schema sections are
all the one `content.folder-browser` mechanism with a different root/file
parameter.

Back is via explicit controls only — breadcrumb links, the rail logo (Home), or
the category dropdown (jumps straight to another category's file list). No
browser-back support, by spec.

## Spec → code

| Component | Implementation |
|---|---|
| `content-folder-browser.yaml` | `scripts/build-manifest.mjs` (the scan) + `src/app/core/folder-browser.ts` (reads the manifest, one code path for both roots) |
| `view-state.yaml` | `src/app/state/view-state.ts` — `current` + `activeRoot` / `selectedCategory` / `selectedFile`, all set by click handlers |
| `delivery-request-response.yaml` | `src/app/core/delivery.ts` — `deliver(browser, root, category, file)` |
| `style-visual-theme.yaml` | `src/styles.css` + `src/app/ui/*` — shared Catenator design system, selected item = filled |
| `branding-rename.yaml` | `src/app/brand/brand.ts` — single product-name literal |

See `BUILD_REPORT.md` for the per-component mustNever / micro verification.
