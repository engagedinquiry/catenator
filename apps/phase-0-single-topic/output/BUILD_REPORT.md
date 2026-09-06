# Build report — Phase 0 (`phase-0-single-topic`)

Schema: `apps/phase-0-single-topic/schemas/` · Config: `apps/phase-0-single-topic/prompts/build-config.yaml`
Output: `apps/phase-0-single-topic/output/` · Stack: Angular 22 (standalone, signals, lazy routes)
Tests: `npm test` → 34/34 passing.

## Scope

`system.yaml` `components:` names **9** component files. All 9 were built. The
two files present but **not** referenced by `system.yaml` — `branding-rename.yaml`
and `style-visual-theme.yaml` — were treated as out of scope
(BUILD_INSTRUCTIONS: "Do not add … components not named in the schema"). The
product rename to *Catenator* was still applied because `build-config.yaml`
carries a `branding` block; `style-visual-theme`'s reference-app inspection was
not performed.

## Components built new vs. reused

Everything here is **new code** written against this schema. A prior bounded
refraction app (`syntaxia-studio`, read-only) covered a subset of an earlier
version of this schema; where its shape still fit, structure and copied CSS
token values were carried over and then adapted to the phase-0 rules:

| Area | Origin | Status |
|---|---|---|
| `styles.css` design tokens, three-panel CSS | `syntaxia-studio/src/styles.css` | values copied, self-contained; no runtime link |
| `ui/icon-registry.ts` SVGs | `syntaxia-studio` icon subset | copied; logo key renamed `icon-catenator-logo`; component re-typed as `AppIcon` |
| `ui/app-icon.ts`, `ui/app-rail.ts`, `ui/step-nav.ts`, `ui/step-guide.ts`, `ui/key-banner.ts`, `ui/step-defs.ts` | `syntaxia-studio` equivalents | reimplemented; "Syntaxia"/"Studio" identifiers removed |
| `core/session-store.ts`, `core/step-guards.ts`, `app.*` | `syntaxia-studio` equivalents | reimplemented for the phase-0 field shapes |
| `core/parse-freetext.ts` | — | rewritten: markdown H2 format, no inference |
| `core/refraction.ts` + `core/transports/*` | — | rewritten: transport injection, retry-once, structured errors |
| `core/grounding.ts`, `core/gate-rules.ts` | — | new |
| all `steps/*` | `syntaxia-studio` equivalents | reimplemented against phase-0 rules |

---

## mustNever / micro verification

### system.yaml (top level)

| Rule | How it is satisfied |
|---|---|
| mustNever: >2 personas per topic | `MAX_PERSONAS = 2` (`model/models.ts`); form caps "+ Add persona" and `resolve()` slices; `parsePersonas` slices to 2. Test: *personas parser caps at MAX_PERSONAS (2)*, *MAX_PERSONAS is 2*. |
| mustNever: >1 topic per lab instance | Single `topicText` signal; Step 1 has one textarea and no "add topic" control; `topicId` is a single computed value. |
| mustNever: bypass linear gating via step-nav display | `StepNav` rows are plain `routerLink`s; every protected route has a `canActivate` guard (`step-guards.ts`) that re-runs on any entry. Test: *gating* suite. |
| mustNever: state a fact absent from topic/sources | `buildSystemPrompt()` hard rule + `check.grounding` post-check that blocks delivery of unverified specific claims. Tests: *compiler* + *grounding* suites. |

### components/layout-three-panel.yaml

| Rule | How it is satisfied |
|---|---|
| macro.mustNever: this component alters gating/state/pipeline | `layout.three-panel` is CSS (`styles.css` `.workspace`/`.panel-*`) + three presentational components (`step-nav`, `router-outlet`, `step-guide`). None import the store for writes; `StepNav` reads `done()` display flags only. |
| micro.nav-display-only | `StepNav` links route through the same guards; documented + `gating` tests. |
| micro.reusable-template | Panel 1 and Panel 3 both render from `STEP_DEFS` (`ui/step-defs.ts`); nothing per-step is hard-coded in `step-nav.ts` / `step-guide.ts`. |

### components/gating-linear-sequential.yaml

| Rule | How it is satisfied |
|---|---|
| macro.mustNever: step-nav clicks skip incomplete prior steps | Guards on `/sources`, `/personas`, `/refract`, `/publish`; `redirectTarget()` returns a redirect for any unmet prerequisite. Tests: *a click on "sources" before a topic exists redirects to topic*. |
| micro.redirect-on-incomplete | `redirectTarget()` follows fallbacks transitively to the earliest incomplete step. Tests: *jumping to publish with nothing done redirects to topic*. |

### components/state-topic-refraction.yaml

| Rule | How it is satisfied |
|---|---|
| macro.mustNever: lose/overwrite author data between steps | `SessionStore` fields are only replaced on an explicit author `set*()` action; navigation never clears. `setTopic()` cascades only when the topic text actually changed. |
| macro.mustNever: persist beyond current session | Plain in-memory signals; no `localStorage`/disk/IndexedDB anywhere. `persistenceScope` documented in the class. |
| micro.refracted-output-map | `refractedOutputs: Map<personaId, Refraction>`; `putRefraction()` sets one key, never merges. Tests: *publish* suite keys by exact personaId. |

### components/input-mode-dual.yaml

| Rule | How it is satisfied |
|---|---|
| macro.mustNever: two modes produce divergent data | Both modes resolve to the same `SourceItem` / `Persona[]` shape and pass the same completion check (`sources-step.ts` / `personas-step.ts` `resolve()` + `next()`). Test: *sources/personas free-text markdown parses to the expected …*. |
| macro.mustNever: split one labeled record into multiple entries | `parseSources()` returns exactly one record. Test: *parseSources returns exactly one entry*. |
| macro.mustNever: block advancement after free-text parses | `next()` uses the identical title+description check for both modes; no extra free-text gate. |
| macro.mustNever: infer a field not stated | `parseSource` leaves an absent section blank; `parsePersonas` only sets a dimension whose name literally appears on a dimension line. Tests: *parse-only-what-is-stated* ×2. |
| macro.mustNever: structured field without label + placeholder | Every `<input>/<textarea>` in `sources-step.ts` / `personas-step.ts` has a visible `<label>` and a `placeholder`. |
| macro.mustNever: markdown marks / quotes in parsed value | `cleanValue()` strips `#`, leading bullets, and matched surrounding quotes. Tests: *clean-value-extraction*. |
| micro.mode-parity | Free-text parses into the exact `SourceItem` / `Persona` fields the form writes. |
| micro.sources-format | `## Title` / `## Source` / `## Description` H2 sections; `"Label:"` prefix style not parsed. Test: *deprecated "Label:" prefix style is NOT parsed*. |
| micro.personas-format | `## <name>` heading is the name; following paragraph the summary; a comma-separated line of known dimension names is the dimensions list (matched, not label-prefixed). |
| micro.parity-check-required | `tests/parse-freetext.test.mjs` runs the parsers against `fixtures/rate-limiting/` and asserts equality with the values from `expected-parsed.yaml` (counts, field values, dimensions, cleanliness). |
| micro.advance-after-parse | Same `next()` path for both modes. |
| micro.parse-only-what-is-stated | See mustNever "infer a field not stated". A dimension name present in text is recognised (word must appear); nothing is auto-completed. |
| micro.field-labels-and-placeholders | See mustNever above. |
| micro.clean-value-extraction | `cleanValue()` + `collapseParagraph()`. Test: *clean-value-extraction*. |
| micro.downloadable-template | "Download blank template (.md)" button on both steps → `ui/freetext-template.ts` (`SOURCES_TEMPLATE` / `PERSONAS_TEMPLATE`, headers only). |

### components/byok-compiler-contract.yaml

| Rule | How it is satisfied |
|---|---|
| macro.mustNever: invent a value not in topic/sources | `buildSystemPrompt()` hard rule; `check.grounding` verifies before delivery. |
| macro.mustNever: depend on a specific provider | `refractOnce(req, transport)` takes an injected `RefractionTransport`; `core/refraction.ts` imports no transport. Two implementations under `core/transports/`. Test: *model-agnostic: the same request works through any transport shape*. |
| macro.mustNever: fail silently on a call error | `refractOnce` returns `{ ok:false, error: CompilerError }`; `RefractionService` collects failures; `refract-step.ts` renders each as a visible `.warn-box`. Tests: *a retryable failure … returns errorOutput*, *an empty model response is treated as malformed, not a success*. |
| macro.mustNever: add content beyond dimensions/topic/sources | System-prompt no-scope clauses ("Do not add extra sections … asides … suggestions"; "as short as correctly serving this persona allows"). Test: *system prompt forbids … external-material references* (checks the no-scope clause). |
| macro.mustNever: reference material outside what was provided | System-prompt disclosure clause ("do not say where such a value might otherwise be found or that other documentation exists"). |
| micro.missing-value-behavior | System prompt: "say plainly that it is not specified here. Do not fill the gap." |
| micro.model-agnostic | `contractShape` is identical across transports; `RefractionResult` records `provider` + `model`. |
| micro.call-failure-behavior | `refractOnce` retries the same call exactly once for retryable errors, then returns `errorOutput`; non-retryable errors are not retried; malformed responses log the raw body (`console.error('[byok-compiler] malformed response (raw):' …)`); never returns empty-as-success. Tests: *retried exactly once*, *a non-retryable failure is not retried*, *a retry that succeeds yields a result*. |
| micro.no-unrequested-scope | System-prompt no-scope clauses (above). |
| micro.no-speculation-about-external-material | System-prompt disclosure clause (above). |
| micro.refract-all-personas-one-action | `RefractionService.refractAll()` loops every persona; `refract-step.ts` has one button labelled "Refract for N personas". |
| micro.clean-persona-name-display | `refract-step.ts` shows `{{ r.personaName }}` only; no YAML/JSON/list syntax. `personaName` is the plain `Persona.name`. |

### components/interrupt-conditional-api-key.yaml

| Rule | How it is satisfied |
|---|---|
| macro.mustNever: show interrupt when a key is set | `KeyBanner.visible()` requires `!store.hasApiKey()`. |
| macro.mustNever: block navigation through Steps 0–3 | `KeyBanner` is an inline `role="status"` notice with a dismiss; no guard, no route. |
| macro.mustNever: add as a permanent numbered step | Not in `app.routes.ts` / `STEP_DEFS`; lives in the shell (`app.ts`). |
| micro.hard-block-at-refract-only | `/refract` disables its action while `!hasApiKey()` and shows its own error link; the banner hides on `refract` (nothing to add). Steps 0–3 stay reachable regardless of key. |

### components/check-grounding.yaml

| Rule | How it is satisfied |
|---|---|
| macro.mustNever: deliver output with an ungrounded specific claim | `resolveDelivery()` returns `{ type: 'ungrounded-claim' }` for a persona with unresolved untraced claims unless the verifier approved it. Test: *an ungrounded, unapproved persona cannot be delivered*. |
| micro.missing-fact-disclosure | `check.grounding` never fills a value; it lists untraced claims and the system prompt states absent facts as absent. `refract-step.ts` shows the per-claim "traced / not traced" list. |

### components/delivery-request-response.yaml

| Rule | How it is satisfied |
|---|---|
| macro.mustNever: return a different persona's output | `resolveDelivery()` reads `ctx.refractedOutputs.get(req.personaId)`. Test: *returns the exact persona requested, never another*. |
| macro.mustNever: return output for a not-yet-refracted persona | Missing map entry → `{ type: 'not-yet-refracted' }`. Test: *a persona not yet refracted returns a structured not-yet-refracted error*. |
| macro.mustNever: ask the reader for a topicId | `publish-step.ts` has only a persona `<select>`; `topicId` is passed from `store.topicId()`. Test: *a wrong topic id is rejected (id is supplied by the app, not the reader)* confirms it is still contract-checked. |
| macro.mustNever: display a persona name using data-structure syntax | The `<option>` shows `{{ r.personaName }}` only — plain text, no id suffix. |
| micro.exact-persona-match | `refractedOutputs.get(req.personaId)` — exact key. |
| micro.topic-id-implicit-in-single-topic-scope | `topicId` stays in `DeliveryRequest` but is supplied by the app; not user-facing. |
| micro.clean-persona-name-display | Plain name only; no `persona-0` identifier shown. |

### components/step-introduction.yaml

| Rule | How it is satisfied |
|---|---|
| macro.mustNever: any form field / data-entry control on this step | `intro-step.ts` template is prose + a single "Begin →" navigation button. No `FormsModule` import, no inputs. |
| micro.no-data-entry | `IntroStep` injects only `Router`; touches no store. |

---

## Build config compliance

- `techStack.frontend: Angular` — Angular 22 standalone.
- `aiProvider.mode: BYOK`, `supported: [Claude, Gemini]` — key entered in Settings, held in memory; both providers implemented; no single provider hardcoded in the contract.
- `branding.productName: Catenator`, `tagline: "Creating and Refracting"` — one source of truth `src/app/brand/brand.ts`; page title set at runtime; top bar + rail read from it. `priorNames` scan: `tests/branding.test.mjs` asserts no "Syntaxia" / "Syntaxia Studio" anywhere in `src/`.

## Known limitations

- `check.grounding` is a deterministic token check (numbers, header names, ALL-CAPS, quoted phrases), not a semantic judge; a paraphrased ungrounded claim with no specific tokens can pass. The verifier acknowledgement step is the backstop.
- No live provider call is exercised by `npm test`; `npm run verify:refraction` covers that path against a real key.
- `style-visual-theme` (out of scope) not applied — visual language is the carried-over token set only.
