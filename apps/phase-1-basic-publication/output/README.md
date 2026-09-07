# Catenator — Creating and Refracting, Basic Publication (Phase 1)

The progressive next step from Phase 0. Instead of one topic, you author a
**publication**: a hierarchy of topics of arbitrary depth, sharing one set of
sources (with per-topic override), up to two personas, and publication-level
variables — then refract every topic for every persona in **one action** (BYOK).

Built from `apps/phase-1-basic-publication/specs/` per
`apps/shared/RUN_TEMPLATE.md`. Everything is in memory: a page reload starts
fresh. No modal dialogs anywhere in this phase.

## Run

```
npm install
npm start      # dev server on http://localhost:4200
npm test       # 41 assertions over the deterministic core + fixture parity
npm run build
```

## Layout — one workspace, three panels

- **Panel 1 — accordion**, exactly five sections: **Publication, Topics,
  Variables, Sources, Personas**. (Shared Blocks is a later phase — not here.)
  The Topics section is the arbitrary-depth tree; each topic has add-child,
  delete, move-up, move-down. Move only reorders siblings. Delete shows how many
  descendant topics go with it, inline, before you confirm.
- **Panel 2 — the generic editor** (`src/app/ui/editor-generic.ts`). Publication
  metadata, Variables, Sources and Personas render as **forms** (no Preview).
  A **Topic** renders as markdown with **Metadata / Editor / Preview** tabs.
  A fresh load shows the Publication form.
- **Panel 3 — Guide** (five fixed blocks, one per selection type, never
  generated) and **Quality Check**.

Below 768px a dismissible notice says the workspace is best on a larger display;
the layout itself does not change.

## Sources & per-topic override

`src/app/core/sources.ts`. Every topic uses all publication sources by default.
A topic's Metadata tab can switch it to an explicit subset — that override
affects **only that topic**. A dangling override id is a Quality Check finding.

## Variables

`src/app/core/variables.ts`. Publication-level `{{name}}` pairs, case-sensitive.
**Not** substituted while you type — Preview shows the raw token; Quality Check
verifies every reference resolves.

## Quality Check — four checks (`src/app/core/quality-check.ts`)

1. Every topic has a name.
2. Every per-topic source override points at a real source.
3. Every `{{variable}}` referenced in a topic is defined.
4. At least one persona exists — this one **gates refraction**.

Runs only from the "Run checks" button; each failure names the specific item.

## Refraction — one action (`src/app/core/publication-refract.ts`)

One "Refract publication" click makes one compiler call per (topic × persona)
pair. Each call uses that topic's resolved sources; each follows Phase 0's
retry-once-then-structured-error behaviour; a failure on one pair never blocks
the others. Every successful output is grounding-checked (`core/grounding.ts`,
reused from Phase 0) against that topic's content + resolved sources — an
ungrounded result is surfaced as an error, not shown as text.

## Providers (BYOK)

`src/app/core/transports/` — interchangeable `anthropic.ts` / `gemini.ts` behind
one `RefractionTransport` interface, reused from Phase 0. The refraction core
imports only the interface. Set provider + key + model in **Settings** (a plain
page, not a dialog; in memory for the session).

## Live refraction check

```
ANTHROPIC_API_KEY=... npm run verify:refraction
VERIFY_PROVIDER=gemini GEMINI_API_KEY=... npm run verify:refraction
```

See `BUILD_REPORT.md` for the per-component build map and
`../reports/compliance-*.md` for the rule-by-rule verification.
