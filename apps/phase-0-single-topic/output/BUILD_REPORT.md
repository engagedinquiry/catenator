# Build report — phase-0-single-topic

Fresh build from `apps/phase-0-single-topic/specs/` per `apps/shared/RUN_TEMPLATE.md`
(FRESH BUILD MODE). `output/` was cleared completely first — 57 tracked source
files + ~231 MB of `node_modules` / `dist` / `.angular`.

## Components → files

| Component | Built in |
|---|---|
| `layout.three-panel` | `src/app/app.ts` (shell), `src/app/ui/step-nav.ts`, `src/app/ui/step-guide.ts`, `src/app/ui/step-defs.ts` (the shared list) |
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

All 11 built new (fresh build). No code reused from a prior build.

## Notable spec deltas honoured this build

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

- `npm test` — 25/25 pass (Node 22), including the fixture parity check.
- `npm run build` (production) — clean, 262 kB initial.
- In-browser: the six-step gated flow (direct `/publish` → `/topic`), both input
  modes, free-text parse, the Refract-only key block, the plain-number step nav.
- Compliance report: `apps/phase-0-single-topic/reports/compliance-2026-09-07-1050.md`
  — no "Not found" or "Conflicting" rows; two "Present but unverified"
  (a live model call; the style reference inspection).

## Live refraction

```
ANTHROPIC_API_KEY=... npm run verify:refraction
VERIFY_PROVIDER=gemini GEMINI_API_KEY=... npm run verify:refraction
```

runs the real `buildPrompt` / `refractOnce` path against a provider with the two
contrasting rate-limiting fixture personas.
