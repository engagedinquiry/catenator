# Catenator — Creating and Refracting (Phase 0)

A single-topic, two-persona refraction lab. Paste one conceptual topic, ground it
with a source, name up to two readers, refract each via your own model provider
(BYOK), and publish a chosen reader's version for delivery.

Built from `apps/phase-0-single-topic/specs/` per `apps/shared/RUN_TEMPLATE.md`.
Everything is in memory: a page reload restarts the flow.

## Run

```
npm install
npm start      # dev server on http://localhost:4200
npm test       # 25 assertions over the deterministic core + fixture parity
npm run build
```

Open the lab. If no API key is set, a banner links to **Settings** (provider +
key + model, held in memory for the session only). Then walk the steps.

## Steps (linear, gated)

| Route | Step | Enter when |
|---|---|---|
| `/intro` | 0 Introduction — framing + "Begin", no data entry | — |
| `/topic` | 1 Paste one conceptual topic | — |
| `/sources` | 2 Title / Source / Description — form **or** markdown (`## Title` / `## Source` / `## Description`) | topic exists |
| `/personas` | 3 Up to 2 readers — form **or** markdown (`## <name>`, a summary paragraph, a trailing dimension line from Surface / Content / Context / Time / Trust) | topic + source |
| `/refract` | 4 One action refracts every persona; a missing API key blocks **only** this step | topic + source + ≥1 persona |
| `/publish` | 5 A reader picks a persona; every request is grounding-checked before it is served | all prior + every persona refracted |

Guards (`src/app/core/step-guards.ts` over `core/step-order.ts`) redirect to the
earliest incomplete step. `StepNav` rows are plain `routerLink`s, so a click on a
locked step hits the same guard.

## Providers (BYOK)

`src/app/core/transports/` has interchangeable `anthropic.ts` (Claude) and
`gemini.ts` implementations of one `RefractionTransport` contract. The compiler
core (`core/refraction.ts`) imports only the interface — the transport is chosen
at call time by provider, so nothing in the contract depends on one vendor.

## Grounding

`core/grounding.ts` extracts the specific, checkable claims from a refracted text
(numbers, header/identifier names, code spans, quoted phrases) and requires each
to appear in the topic or sources. A claim stated as *absent* ("the topic does
not specify …") is exempt. `core/delivery.ts` runs this on **every** delivery
request — an ungrounded claim returns `{type: 'ungrounded-claim'}` and the output
is not served.

## Live refraction check

```
ANTHROPIC_API_KEY=... npm run verify:refraction
VERIFY_PROVIDER=gemini GEMINI_API_KEY=... npm run verify:refraction
```

See `BUILD_REPORT.md` for the per-component build map and
`../reports/compliance-*.md` for the rule-by-rule verification.
