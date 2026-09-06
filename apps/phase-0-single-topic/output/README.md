# Catenator — Creating and Refracting (Phase 0)

A single-topic, two-persona refraction lab. Paste one conceptual topic, ground
it with a source, name up to two readers, refract each via your own model
provider (BYOK), and publish a chosen reader's version for delivery.

Built from `apps/phase-0-single-topic/schemas/` per `apps/shared/BUILD_INSTRUCTIONS.md`.
Everything is in-memory: a page reload restarts the flow.

## Run

```
npm install
npm start            # dev server on http://localhost:4200
npm test             # 34 assertions over the deterministic core (needs Node >= 22.6)
npm run build
```

Open the lab. If no API key is set, a dismissible banner links to **Settings**
(Provider + key + model, held in memory for the session only). Then walk the
steps.

## Steps (linear, gated)

| Route | Step | Enter when |
|---|---|---|
| `/intro` | Introduction — framing + "Begin →" (no data entry) | — |
| `/topic` | Paste one topic (raw text) | — |
| `/sources` | Title / source / description — form **or** markdown (`## Title` / `## Source` / `## Description`) | topic exists |
| `/personas` | Up to 2 personas + dimensions (Surface / Content / Context / Time / Trust) — form **or** markdown (`## <name>`, summary paragraph, dimension line) | topic + source |
| `/refract` | One call per persona in one action; grounding check per output | topic + source + ≥1 persona |
| `/publish` | Choose a reader, get that reader's output; topic id is implicit | all prior + every persona refracted |

Guards (`src/app/core/step-guards.ts` over `core/gate-rules.ts`) redirect to the
earliest incomplete step. `StepNav` rows are plain `routerLink`s, so a click on
a locked step hits the same guard.

## Providers (BYOK)

`src/app/core/transports/` has interchangeable `anthropic.ts` (Claude) and
`gemini.ts` implementations of one `RefractionTransport` contract. The compiler
core (`core/refraction.ts`) imports neither — the transport is chosen at call
time by provider, so nothing in the contract depends on one vendor.

## Step 4 verification

```
ANTHROPIC_API_KEY=... npm run verify:refraction
VERIFY_PROVIDER=gemini GEMINI_API_KEY=... npm run verify:refraction
```

Runs the real `buildPrompt` / `refractOnce` path against a live provider with two
contrasting personas and reports divergence.

See `BUILD_REPORT.md` for the per-component mustNever / micro verification.
