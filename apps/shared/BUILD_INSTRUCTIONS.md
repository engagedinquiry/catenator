# Build instructions — reading and building from any Catenator spec

These instructions are generic. They apply to any Catenator spec, not
just this one — the only thing that changes per app is the spec itself
and its accompanying `build-config.yaml`. (A spec is a schema filled
in — see the Catenator standard's own vocabulary at `docs/schema/` if
that distinction isn't already clear.)

Given a spec (split across `system.yaml`, `vocabulary.yaml`, and
`components/*.yaml`) and a `build-config.yaml`, together these files
are the complete specification for the build. Do not add features,
personas, steps, or components not named in the spec.

Write all generated output to the path named in `build-config.yaml`'s
`outputPath`. Do not write generated code anywhere else, and do not
hand-edit generated output directly once produced — if something is
wrong, fix the spec or the config and regenerate, so the spec stays
the actual source of truth.

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
where the spec states an explicit rule or number, implement exactly
that value — never infer a substitute.

Use the technology and provider named in `build-config.yaml`. Do not
hardcode a specific AI model provider anywhere outside the component
whose contract explicitly names it as swappable (check each
component's `mustNever` list for a "depend on a specific provider"
constraint).

## Favicon (applies to every app, always)

Every generated app must copy the favicon files from
`apps/shared/assets/favicon/` into its own output's asset directory
(e.g. `src/assets/favicon/` for Angular), and reference them in the
app's `index.html` `<head>` with standard favicon link tags:

```html
<link rel="icon" type="image/x-icon" href="assets/favicon/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="assets/favicon/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/favicon/favicon-180.png">
```

Make sure the build actually serves that asset directory (for Angular,
add `src/assets` to the `assets` array in `angular.json`). This applies
to every app generated from any Catenator spec, fresh build or
component update — do not skip it, and do not substitute a different
icon.

After building, verify against every `mustNever` and `micro` rule
across every component file explicitly — for each one, state how the
implementation satisfies it, or flag it as unmet. Do not report the
build complete until every constraint has a stated, verified answer.

Report back: which components were built new, which reused existing
code (name the source), and the full mustNever/micro verification
list, organized by component file.