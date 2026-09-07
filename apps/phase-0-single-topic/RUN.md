# Run — Catenator app build/update

STOP. Before doing anything else:

1. Open and read the file at `apps/shared/RUN_TEMPLATE.md`, in full,
   right now. Do not proceed from memory or from having seen it
   before — open it and read its current, actual content.

2. Substitute these values into every `{PLACEHOLDER}` in that file:

PHASE = phase-0-single-topic
APP_DIR = apps/phase-0-single-topic/
OUTPUT_DIR = apps/phase-0-single-topic/output/
CONFIG_FILE = apps/phase-0-single-topic/prompts/build-config.yaml
COMPONENTS = []
FIXTURE_DIR = "apps/phase-0-single-topic/fixtures/rate-limiting/"

3. Execute every step written in `RUN_TEMPLATE.md`, literally, in the
   order they appear — including its MODE CHECK, and including its
   MANDATORY LAST STEP (generating and saving the timestamped
   compliance report). Do not skip, summarize, paraphrase, or
   substitute your own judgment for any step written there.

4. Do not report this build complete until the compliance report
   file specified in `RUN_TEMPLATE.md`'s mandatory last step actually
   exists on disk. If you reach the end without having created that
   file, stop and report that the mandatory step was not completed —
   do not report success anyway.