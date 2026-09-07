# Build report — phase-1-basic-publication

Fresh build from `apps/phase-1-basic-publication/specs/` per
`apps/shared/RUN_TEMPLATE.md` (FRESH BUILD MODE). `output/` did not exist —
built complete from nothing. Generated 2026-09-07 13:51.

## Components → files

| Component | Built in |
|---|---|
| `layout.three-panel` | `src/app/ui/workspace.ts`, `src/app/ui/accordion-nav.ts`, `src/app/ui/panel3.ts`, `src/app/ui/narrow-viewport-notice.ts`; shell rail in `src/app/app.ts` |
| `publication.metadata` | `src/app/ui/publication-form.ts`; `PublicationStore.meta` in `src/app/core/publication-store.ts` |
| `topic.hierarchy` | `src/app/core/tree.ts` (pure ops), `src/app/core/ids.ts`, `src/app/ui/topic-tree-node.ts` (recursive), `PublicationStore` topic methods |
| `source.with-override` | `src/app/core/sources.ts`, `src/app/ui/sources-form.ts`, override UI in `src/app/ui/topic-editor.ts` |
| `persona.catalog` | `src/app/ui/personas-form.ts`; positional ids + cap in `src/app/core/publication-store.ts`; `FIXED_DIMENSIONS`/`MAX_PERSONAS` in `src/app/core/models.ts` |
| `variable.substitution` | `src/app/core/variables.ts` (no live substitution), `src/app/ui/variables-form.ts` |
| `editor.generic` | `src/app/ui/editor-generic.ts` (form vs. topic-tabs switch), `src/app/ui/topic-editor.ts`, `src/app/ui/markdown-view.ts` |
| `guide.static-per-selection` | `src/app/core/guide-content.ts` (5 fixed blocks), `src/app/ui/guide-panel.ts` |
| `quality-check.four-checks` | `src/app/core/quality-check.ts`, `src/app/ui/quality-check-panel.ts` |
| `refraction.publication-level` | `src/app/core/publication-refract.ts` (fan-out + grounding gate), `src/app/core/refraction.ts` + `src/app/core/grounding.ts` (reused from phase-0), `src/app/core/transports/*` (reused), `src/app/ui/refract-bar.ts` |
| `branding.rename` | `src/app/brand/brand.ts` (single literal) |
| `style.visual-theme` | `src/styles.css` (phase-0 tokens reused verbatim), `src/app/ui/icon-registry.ts` (inline SVG, reused) |

All 12 components built new. `refraction.ts`, `grounding.ts`, `transports/*`,
`icon-registry.ts`, `app-icon.ts`, `styles.css`, and the test harness
(`tests/run.mjs`, `loader.mjs`, `register.mjs`) were **reused verbatim from
phase-0-single-topic** — `style.visual-theme.reuse-phase-0-tokens-first` and
`refraction.publication-level.same-failure-behavior-as-phase-0` explicitly call
for this.

## Notable spec points honoured

- `topic.hierarchy` — the tree is fully recursive; no function counts or caps
  depth. `moveSibling` only ever reorders within one `children[]` array.
- `persona.catalog.persona-id-is-positional` — `persona-0` / `persona-1` from a
  monotonic `personaSeq`, never derived from the name, never reused.
- `variable.substitution` — `variables.ts` deliberately exports **no**
  substitute/render function; Preview shows the raw `{{name}}` token.
- `quality-check.four-checks` — runs only from the explicit "Run checks" button;
  `persona-exists` gates `refractPublication`.
- `system.yaml` mustNever "no modal dialog" — every selection and the delete
  confirmation are inline in Panel 2 / the tree; a test scans for dialog markers.
- Shared Blocks — no accordion section, no model, no code. Test asserts exactly
  5 accordion headers.

## Deviations

None. `style.visual-theme` external reference-path inspection was not performed
(absolute local path); phase-0's committed tokens were reused, as the spec
prefers.

## Fixture

`RUN.md` set `FIXTURE_DIR` to `apps/phase-1-basic-publication/fixtures/rate-limiting/`
but that folder shipped empty. `fixtures/rate-limiting/publication.json` (a clean
3-level rate-limiting publication) + `expected.json` were created for this build;
`tests/fixture-parity.test.mjs` asserts flattened topic order, per-topic resolved
sources, referenced variables, an all-pass Quality Check, and a 10-call fan-out.

## Verification

- `npm test` — 41/41 pass (Node 22.23.2), including 5 fixture-parity assertions.
- `npm run build` (production) — clean, 256.5 kB initial.
- `npm run verify:refraction` — runs the real publication fan-out end-to-end
  (reaches the provider; HTTP 404 without a real key).
- In-browser (headless): default publication form, five accordion sections, add
  topic / add child / inline delete showing the descendant count, topic
  Metadata/Editor/Preview tabs with `{{api_name}}` shown raw in Preview, personas
  capped at 2 with ids `persona-0`/`persona-1`, four Quality Checks with per-item
  failures, Refract disabled with no key, the < 768px notice.
- Compliance report: `apps/phase-1-basic-publication/reports/compliance-2026-09-07-1351.md`
  — no "Not found" or "Conflicting" rows; two "Present but unverified" (a live
  model call; the external style-reference inspection).

## Live refraction

```
ANTHROPIC_API_KEY=... npm run verify:refraction
VERIFY_PROVIDER=gemini GEMINI_API_KEY=... npm run verify:refraction
```

refracts the fixture publication (every topic × every persona) against a real
provider, using the same module resolver as the test suite.
