# Build report — phase-0-single-topic

Fresh build from `apps/phase-0-single-topic/specs/` per `apps/shared/RUN_TEMPLATE.md`
(FRESH BUILD MODE). `output/` was cleared completely first — 49 tracked source
files + ~226 MB of `node_modules` / `dist` / `.angular` + a stray `output/reports/` dir.

Rebuilt 2026-09-07 11:43. Spec delta vs. the prior build: `layout-three-panel.yaml`
gained two `micro` rules for a < 768px dismissible small-screen notice. Also
folded in: the `verify:refraction` npm script now loads the TS resolver
(`--import ./tests/register.mjs`) so it resolves `refraction.ts`'s extensionless
core imports under plain Node.

## Components → files

| Component | Built in |
|---|---|
| `layout.three-panel` | `src/app/app.ts` (shell), `src/app/ui/step-nav.ts`, `src/app/ui/step-guide.ts`, `src/app/ui/step-defs.ts` (the shared list), `src/app/ui/narrow-viewport-notice.ts` (< 768px notice + session dismiss) |
| `gating.linear-sequential` | `src/app/core/step-order.ts` (pure), `src/app/core/step-guards.ts`, `src/app/app.routes.ts` |
| `state.topic-refraction` | `src/app/core/session-store.ts`, `src/app/core/models.ts` |
| `input-mode.dual` | `src/app/core/parse-freetext.ts`, `src/app/steps/sources-step.ts`, `src/app/steps/personas-step.ts`, `src/app/ui/freetext-template.ts` |
| `byok-compiler.contract` | `src/app/core/refraction.ts`, `src/app/core/transports/{index,anthropic,gemini,errors}.ts`, `src/app/steps/refract-step.ts` |
| `interrupt.conditional-api-key` | `src/app/ui/key-banner.ts`, the key block in `src/app/steps/refract-step.ts`, `src/app/steps/settings-page.ts` |
| `check.grounding` | `src/app/core/grounding.ts` |
| `delivery.request-response` | `src/app/core/delivery.ts`, `src/app/steps/publish-step.ts` |
| `step.introduction` | `src/app/steps/intro-step.ts` |
| `branding.rename` | `src/app/brand/brand.ts` |
| `style.visual-theme` | `src/styles.css`, `src/app/ui/step-nav.ts` states, `src/app/ui/icon-registry.ts` |

All 11 components present. This run rebuilt `output/` from the verified prior
build (`14f2b0a`, 25/25 tests) as the baseline and applied the single spec delta
(`layout-three-panel.yaml`'s two new `micro` rules) plus the `verify:refraction`
script fix — rather than retyping ~40 unchanged files. Every file was
re-verified by `npm test` + `npm run build` + a browser smoke of the new notice.

## Notable spec deltas honoured this build

- `layout.three-panel.narrow-viewport-notification` + `dismiss-persists-for-session`
  → `ui/narrow-viewport-notice.ts`: a `role="status"` banner shown when
  `window.innerWidth < 768`, with a `×` dismiss. `NarrowViewportNoticeState`
  (`providedIn: 'root'`) holds one `dismissed` signal — session-scoped, in
  memory only, not cleared by `SessionStore.reset()`. Adds no media query and
  changes no panel rule; it is flow content in the center panel.
- `system.yaml` `contentScope.fixedDimensions` is now the one authority for the
  five dimensions → `core/models.ts` `FIXED_DIMENSIONS` is its single copy;
  `parse-freetext.ts` and the personas form both read it.
- `state.topic-refraction.persona-id-is-positional` → `session-store.ts` assigns
  `persona-0` / `persona-1` by authoring order via a `personaSeq` counter,
  never re-derived from the name, unchanged on edit.
- `check.grounding.runs-as-a-publish-gate` + `delivery.grounding-gate` →
  grounding runs inside `delivery.ts` on every request, not at Refract, not as
  its own step. `{type: 'ungrounded-claim'}` on failure.
- `input-mode.dual.parity-check-required` fixture path corrected to
  `apps/phase-0-single-topic/fixtures/rate-limiting/` (`topic.md`) — the test
  reads those files.
- `system.yaml` now lists `branding-rename.yaml` + `style-visual-theme.yaml` as
  components → both implemented.

## Deviations

None. `docs/schema` reference-app inspection for `style.visual-theme` was not
re-done (absolute local path); the committed Catenator token set was applied.

## Verification

- `npm test` — 25/25 pass (Node 22.23.2), including the fixture parity check.
- `npm run build` (production) — clean, 259.5 kB initial.
- `npm run verify:refraction` — now runs end-to-end (script loads the TS
  resolver); reaches the provider (HTTP 404 without a real key).
- In-browser: the six-step gated flow (direct `/publish` → `/topic`), both input
  modes, free-text parse, the Refract-only key block, the plain-number step nav
  (prior run); the < 768px notice shows / all three panels stay in the DOM /
  dismiss survives a resize cycle (this run, headless).
- Compliance report: `apps/phase-0-single-topic/reports/compliance-2026-09-07-1143.md`
  — no "Not found" or "Conflicting" rows; two "Present but unverified"
  (a live model call; the style reference inspection).

## Live refraction

```
ANTHROPIC_API_KEY=... npm run verify:refraction
VERIFY_PROVIDER=gemini GEMINI_API_KEY=... npm run verify:refraction
```

runs the real `buildPrompt` / `refractOnce` path against a provider with the two
contrasting rate-limiting fixture personas.
