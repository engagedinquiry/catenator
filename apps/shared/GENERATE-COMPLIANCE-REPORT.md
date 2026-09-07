# Prompt — generate a build-compliance report after building from a spec

An app has just been built (or component-updated) from the spec at
[SPEC_DIR]. Produce a compliance report — not a summary claiming the
build is correct, an actual traceability table with cited evidence.

## Requirements for this report

1. **One row per `mustNever` and `micro` rule, across every component
   in the spec.** Do not group or summarize rules — every individual
   rule gets its own row.

2. **Each row must cite the actual file and, where reasonable, the
   specific function/line implementing that rule — quoted, not
   paraphrased.** "This is handled correctly" is not an acceptable
   entry. Quote the real code that does the handling.

3. **If a rule is NOT implemented, or you cannot find code that
   implements it, state that plainly in the row** — do not omit the
   row, and do not describe what the code *should* do instead of what
   it *actually* does. A missing or unverifiable rule is a real
   finding, not something to smooth over.

4. **Do not trust your own summary — verify by reading the generated
   code directly**, the same way you'd review someone else's pull
   request. If a rule says "X must never happen," actually look for a
   code path where X could happen, not just confirm X isn't mentioned
   in a comment.

5. **For any rule involving a shared value between two components
   (e.g. a breakpoint, a config path)**, confirm both components'
   generated code actually use the same value — quote both usages
   side by side.

6. **Test, don't just read, wherever testing is feasible.** If the
   spec defines a fixture or a concrete example, run the app against
   it and report the actual observed output — not the expected
   output restated as if it were observed.

7. **State the overall verdict honestly at the end: fully compliant,
   partially compliant with specific gaps listed, or unable to verify
   — and which.** Do not default to "fully compliant" unless every
   row's citation actually supports it.

## Report format

| Component | Rule ID | Rule (brief) | Implemented in (file:line) | Evidence (quoted code or test result) | Status |
|---|---|---|---|---|---|

Status is one of: **Confirmed** (code quoted, behavior verified),
**Present but unverified** (code exists, not tested), **Not found**
(no implementing code located), **Conflicting** (two components
disagree on a shared value — quote both).

## What to hand back

- The complete table above, every rule, no omissions.
- A short list of any "Not found" or "Conflicting" rows, called out
  separately at the top, since those are the ones that need action
  before this build is trusted.
- Do not proceed to fix anything as part of this report — this step
  is diagnosis only, same discipline as the design-to-spec step
  before it.
