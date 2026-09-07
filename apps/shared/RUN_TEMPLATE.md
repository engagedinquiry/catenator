# Run — Catenator app build/update

Set these values before running. Everything below references only
these — change these lines to run a different app/phase.

PHASE = {PHASE}
APP_DIR = apps/{PHASE}/
OUTPUT_DIR = {APP_DIR}output/
CONFIG_FILE = {APP_DIR}prompts/build-config.yaml
COMPONENTS = {COMPONENTS}
FIXTURE_DIR = {FIXTURE_DIR}

---

FIRST: read apps/shared/BUILD_INSTRUCTIONS.md in full. Everything
below assumes it has been read.

MODE CHECK:

If COMPONENTS is empty:
  → FRESH BUILD MODE.
  Check {OUTPUT_DIR}. If it already contains anything, clear it
  completely before proceeding. Report what was cleared, if anything.
  Read every file under {APP_DIR}specs/ (system.yaml, vocabulary.yaml,
  every file under components/).
  Build the complete app from nothing into {OUTPUT_DIR}.

If COMPONENTS has one or more entries:
  → COMPONENT UPDATE MODE.
  Confirm a project already exists at {OUTPUT_DIR}. If not, STOP —
  report that COMPONENTS was set but no project exists; this should
  run in fresh-build mode instead.
  Read only the files listed in COMPONENTS from {APP_DIR}specs/components/
  — do not re-read other component files unless a listed component's
  rules explicitly reference them.
  Apply each listed component's current rules to the existing code.
  Touch only files responsible for these components.

---

If FIXTURE_DIR is set, test the result against the files inside it.

MANDATORY LAST STEP: follow apps/shared/GENERATE-COMPLIANCE-REPORT.md
exactly. Save the report as a NEW, timestamped file at
{APP_DIR}reports/compliance-YYYY-MM-DD-HHMM.md — never overwrite a
previous report. Do not report the build complete until this file
exists and every row in it is filled.

Report back only: the path to the newly saved compliance report, and
whether it found any "Not found" or "Conflicting" rows.