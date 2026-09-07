# Prompt — generate a spec from a design document

Attached: a design document (design-document.md) for [APP NAME].

Generate the complete Catenator spec for this app, following the
Catenator standard (docs/schema/).

## Requirements for this generation

1. **Read the entire design document first, fully, before writing
   anything.** Do not start generating components from a partial
   read.

2. **Every requirement in the design document must map to something
   in the spec.** Not "covered in spirit" — a specific component and
   a specific rule (mustNever or micro) that satisfies it. If a
   requirement doesn't cleanly map to an existing component, that's a
   signal a new component is needed — do not skip it or fold it
   vaguely into something unrelated.

3. **Nothing in the spec should assert a fact that lives elsewhere
   without citing it.** If two components depend on the same value
   (a breakpoint, a path, a config setting), that value must be
   defined in exactly ONE place, and every other reference must point
   to it by name — never restate it as its own separate number/value
   that could drift out of sync.

4. **No hardcoded content-specific values** (names, labels, filenames,
   assumed folder depth) unless the design document explicitly states
   a fixed, known value. When in doubt, make it a config value in
   build-config.yaml rather than embedding it in a component.

5. **Before presenting the spec as finished, self-check it:**
   - Verify every `ref:` in system.yaml has a matching file that
     actually exists — list them side by side and confirm the match.
   - Grep the full spec for any requirement-bearing word from the
     design document (e.g. "fixed," "left," a specific number) to
     confirm it's actually implemented somewhere, not just mentioned
     in an intent field with no component making it real.
   - Check every pair of components that reference the same value or
     concept and confirm they agree (same number, same name, same
     definition) — do not assume agreement, check it.

6. **Produce a traceability table alongside the spec** — one row per
   design-document requirement, citing the specific component + rule
   id that satisfies it. An empty or vague citation in this table is a
   real, reportable gap, not something to gloss over. State explicitly
   if any gap is found — do not claim full coverage unless every row
   is genuinely filled.

7. **Do not generate or modify any application code as part of this
   step.** This step produces the spec and the traceability table
   only. Building the app from this spec is a separate, later step.

## What to hand back

- The complete spec (system.yaml, vocabulary.yaml, build-config.yaml,
  and every components/*.yaml file), as individual files.
- The traceability table (design document → spec).
- A plain statement of any requirement from the design document that
  could NOT be cleanly mapped to a spec component, if any — do not
  omit this even if it's uncomfortable to report.
