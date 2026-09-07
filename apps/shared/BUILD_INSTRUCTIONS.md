# Build instructions — reading and building from any Catenator schema

These instructions are generic. They apply to any Catenator schema, not
just this one — the only thing that changes per phase is the schema
itself and its accompanying `build-config.yaml`.

Given a schema (split across `system.yaml`, `vocabulary.yaml`, and
`components/*.yaml`) and a `build-config.yaml`, together these files
are the complete specification for the build. Do not add features,
personas, steps, or components not named in the schema.

Write all generated output to the path named in `build-config.yaml`'s
`outputPath`. Do not write generated code anywhere else, and do not
hand-edit generated output directly once produced — if something is
wrong, fix the schema or the config and regenerate, so the schema
stays the actual source of truth.

Read in this order before writing any code:

1. `vocabulary.yaml` — every domain term's definition. Each definition
   states what that term implies structurally; read it before treating
   a domain value as just a label.
2. `system.yaml` — the overall shape: `systemName`, `intent`,
   `mustNever`, `contentScope`, `personas`, `deployedProcess.steps`,
   and the `components` list (each entry points to a file under
   `components/`).
3. Each file under `components/` — each is a fully self-contained
   macro/meso/micro unit. Build each as a distinct, independently
   reviewable piece before wiring them together.

For each component, implement:
- Its `macro.intent` as the component's actual job.
- Every `macro.mustNever` entry as an enforced constraint — write a
  test or check for each one, not just a comment.
- Its `meso` section as the concrete personas/fields/contract it
  exposes to the rest of the app.
- Every `micro` rule as literal, checkable behavior.

Apply `system.yaml`'s `rule.leverage-naming` throughout: where a
component names a recognized convention (e.g. its `domain` value),
build to that convention's standard behavior per `vocabulary.yaml`;
where the schema states an explicit rule or number, implement exactly
that value — never infer a substitute.

Use the technology and provider named in `build-config.yaml`. Do not
hardcode a specific AI model provider anywhere outside the component
whose contract explicitly names it as swappable (check each
component's `mustNever` list for a "depend on a specific provider"
constraint).

After building, verify against every `mustNever` and `micro` rule
across every component file explicitly. Do this by following
`apps/shared/GENERATE-COMPLIANCE-REPORT.md` exactly — the report it
produces IS the verification, not a separate summary written
afterward.

Save the compliance report as a NEW, timestamped file — never
overwrite a previous report. Use the pattern:
`apps/<app>/reports/compliance-YYYY-MM-DD-HHMM.md`. If a report
already exists for this exact build, the new one still gets its own
timestamp; nothing is ever replaced in place.

Do not report the build complete until the compliance report exists
as a saved file and every row in it has been filled — not until every
constraint has a "stated, verified answer" in prose.

Report back only: the path to the newly saved compliance report, and
whether it found any "Not found" or "Conflicting" rows requiring
attention before this build is trusted.
, and the full mustNever/micro verification
list, organized by component file.