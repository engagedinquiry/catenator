# Prompt — generate a spec from a design document

Attached: a design document (design-document.md) for [APP NAME].

Generate the complete Catenator spec for this app, following the
Catenator standard (docs/schema/).

## Requirements for this generation

1. **Read the entire design document first, fully, before writing
   anything.** Do not start generating components from a partial
   read.

2. **Every requirement in the design document must map to something
   in the spec.** A specific component and a specific rule (mustNever
   or micro) that satisfies it — not "covered in spirit." If a
   requirement doesn't cleanly map to an existing component, that's a
   signal a new component is needed.

3. **No duplicated values across files.** If two components depend on
   the same value (a breakpoint, a path, a config setting), define it
   in exactly ONE place, and have every other reference point to it
   by name — never restate it as its own separate value that could
   drift out of sync.

4. **No hardcoded content-specific values** (names, labels, filenames,
   assumed counts or depth) unless the design document explicitly
   states a fixed, known value. When in doubt, make it a config value
   in build-config.yaml rather than embedding it in a component.

5. **Avoid field names that collide with reserved or special-meaning
   keywords in the schema format being used.** If the standard's own
   vocabulary (or the target format — JSON Schema, OpenAPI, etc.) uses
   a term with a specific technical meaning (e.g. `required` as an
   array-of-property-names keyword, not a per-item boolean flag),
   never reuse that exact name for an unrelated purpose. Name the
   unrelated concept something else (e.g. `mandatory` instead of a
   boolean `required`) — check this explicitly, don't assume a
   familiar-sounding word is safe to reuse.

6. **A genuinely different mechanism gets a new component file, never
   an in-place edit that changes what an existing component means.**
   If the design document changes something from "flexible, user-
   editable" to "fixed, uneditable" (or any other change to the
   actual behavior a component describes, not just its wording),
   create a new, distinctly-named component file rather than editing
   the old one to mean something different. Explicitly flag the old,
   now-superseded component file for removal — do not leave it
   sitting in the same folder, unreferenced, contradicting the new
   one.

7. **State explicitly, per collection, whether it's fixed or
   editable.** When a design document describes multiple similar
   collections (e.g. topics, sources, personas, variables), do not
   assume they all share the same add/edit/delete rules just because
   they're structurally similar. Each one's mustNever/micro rules
   must say plainly whether it supports add, edit, delete, and
   reorder — never left implicit or inherited by assumption from a
   sibling collection.

8. **Before presenting the spec as finished, self-check it:**
   - Verify every `ref:` in system.yaml has a matching file that
     actually exists — list them side by side and confirm the match.
   - Grep the full spec for any requirement-bearing word from the
     design document (e.g. "fixed," "left," a specific number) to
     confirm it's actually implemented somewhere, not just mentioned
     in an intent field with no component making it real.
   - Check every pair of components that reference the same value or
     concept and confirm they agree (same number, same name, same
     definition) — do not assume agreement, check it.

9. **Produce a traceability table alongside the spec** — one row per
   design-document requirement, citing the specific component + rule
   id that satisfies it. An empty or vague citation in this table is a
   real, reportable gap, not something to gloss over.

10. **Do not generate or modify any application code as part of this
    step.** This step produces the spec and the traceability table
    only. Building the app from this spec is a separate, later step.

## What to hand back

- The complete spec (system.yaml, vocabulary.yaml, build-config.yaml,
  and every components/*.yaml file), as individual files.
- The traceability table (design document → spec).
- A plain statement of any requirement from the design document that
  could NOT be cleanly mapped to a spec component, if any.
- A plain statement of any component file that is now superseded and
  should be removed, if any.