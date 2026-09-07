# Design document — Creating and Refracting

## What this is

A **single-topic, two-persona refraction lab**, built as a **guided learning
lab**: one bounded task, walked through in ordered steps, each step teaching one
concept before the next unlocks, with a plain-language guide alongside every
step.

The task is: paste one conceptual topic, ground it with sources, name up to two
readers ("personas"), refract the topic for each reader via a large language
model using your own API key, and publish the results so a reader can request
the version shaped for them.

Nothing about this lab is open-ended. It handles **one topic per lab instance**
and **at most two personas per topic**, with **five fixed dimensions** and no
custom ones. It has no block catalogs and no multi-topic management. Those are
explicitly out of scope.

## Who it's for

Two personas, with different access:

- **The author** — full access. Authors the topic, the sources, and the
  personas (Steps 1–3), and drives the refraction (Step 4) and publish (Step 5).
- **The reader** — request-only access. Requests delivery of a refracted output
  by choosing a persona. The reader never sees or supplies anything else — no
  topic picker, no identifiers.

## The steps — linear, gated, no skipping

Six steps, numbered **0 through 5**:

| # | Step | Purpose |
|---|---|---|
| 0 | Introduction | Frame the lab before any data entry |
| 1 | Topic | Paste the one conceptual topic |
| 2 | Sources | Ground the topic with reference material |
| 3 | Personas | Define up to two readers |
| 4 | Refract | Generate one output per persona via BYOK |
| 5 | Publish | Deliver a chosen persona's output on request |

Step order is **strictly enforced**. No step is reachable without the required
data from every prior step. If a later step is accessed directly — by URL or
otherwise — the app **redirects to the earliest incomplete step**. The step
navigation in the left panel is **display only**: clicking an entry there can
never bypass the gate, and clicking an entry for an incomplete future step
behaves exactly like accessing it directly.

## Layout — three panels

Every step is shown in a **three-panel layout**, all three visible at once:

- **Panel 1 — left, narrow.** A vertical step navigation listing Introduction,
  Topic, Sources, Personas, Refract, Publish. Each entry shows its **plain step
  number (0–5)** as the primary identifier. State is shown by treatment:
  **completed = filled background**, **active = outlined / highlighted**,
  **upcoming = neutral**. No icons replace or sit alongside the number.
- **Panel 2 — center, widest.** The active step's form or content.
- **Panel 3 — right.** A plain-language guide for the active step, which updates
  as the active step changes.

Panel 1 and Panel 3 both read from **one shared step-definition list** — neither
is hardcoded per step.

This layout component is **purely visual**. It never touches gating, state, or
any pipeline logic, and it can change without affecting any other component.

### Small screens — a notice, not a redesign

Below **768px** viewport width, a **dismissible banner** states plainly that the
lab isn't optimized for small screens and is best used on a larger display. This
is informational only — the three-panel layout itself does **not** collapse,
restructure, or hide anything at this width; the lab remains exactly as usable
(or as cramped) as it already renders below that breakpoint.

Once dismissed, the notice does not reappear for the rest of the session — it's
an in-memory dismissal, matching the lab's own no-persistence rule, so a fresh
session can show it again.

## What each step does

### Step 0 — Introduction

Framing only. **One short paragraph** describing the lab's purpose and its
outcome, and a **"Begin" action** that advances to Step 1. Panel 3's guide text
here may be empty or a single line.

This step **captures no state** and must contain **no form field or data-entry
control** of any kind.

### Step 1 — Topic

A single free-text field for the one conceptual topic (`topicText`). This is the
only topic the lab will ever hold. There is no way to add a second.

### Step 2 — Sources

Reference material that grounds the topic. Each source is one record of
**`title`, `reference`, `description`**. Entry is offered in **two equivalent
modes** (see "Two ways to enter Sources and Personas").

### Step 3 — Personas

Up to **two** readers. Each persona is **`id`, `name`, `summary`, and a list of
dimensions** drawn from the five fixed dimension names, canonically listed in
`system.yaml`'s `contentScope.fixedDimensions`: **Surface, Content, Context,
Time, Trust**. A third persona must not be allowed. Entry is offered in the same
two modes as Sources.

A persona's `id` is assigned **by authoring order, not derived from its name**:
the first persona is `persona-0`, the second (if any) is `persona-1`. The id is
set once, at creation, and never changes even if the name or summary is later
edited.

### Step 4 — Refract

A **single action generates output for every persona currently defined** — not a
per-persona button. The action's label should say so (e.g. "Refract for all
personas"). Each persona's output is produced by one call to the compiler with
the topic text, the sources, and that one persona.

A **missing API key blocks only this step.** Steps 0–3 stay accessible whether
or not a key is set.

Refracted outputs are held as a **map keyed by persona id** — one entry per
persona, never merged.

### Step 5 — Publish

Makes refracted output available for delivery. A **reader requests one persona's
output** and receives the text refracted for that persona. The reader chooses a
persona and nothing else; the single topic is supplied automatically behind the
scenes.

Before any output is delivered, it must pass the **grounding check** (see
"Grounding") — this check runs here, as a gate on Publish, every time delivery
is requested, not once at Refract time.

## Two ways to enter Sources and Personas

The Sources and Personas steps each offer **a structured form and a free-text
entry**, and the two must produce **identical underlying data**. Neither mode
may:

- produce data that diverges from the other mode,
- split one labeled record into several entries,
- add a gate, delay, or silent failure that the structured-form path doesn't
  have — once free text parses into valid data, "Continue" behaves exactly as it
  does for the form,
- infer, guess, or auto-complete any field the input didn't actually state — a
  dimension not named stays unselected, a source detail not written stays blank,
- carry markdown heading marks, field labels, colons, or structural quote marks
  into a parsed value.

### The structured form

Every field shows **both a visible label** (e.g. "Title") **and placeholder
text inside the input** (e.g. "Short name for the topic"), matching the pattern
already used on the existing Metadata form.

### The free-text format

Both formats are **markdown**.

- **Sources** use H2 sections: `## Title`, `## Source`, `## Description`. Each
  section's body is that field's value. This is the only supported sources
  free-text format; the older `Label:` line-prefix style is deprecated.
- **Personas** use `## <name>` headings — **the heading text itself is the
  persona's name**, with no "Persona 1:" label. The paragraph immediately after
  the heading is the summary. A following line containing a comma-separated list
  that matches one or more of `system.yaml`'s canonical `fixedDimensions` is that
  persona's dimensions — **recognized by matching the known names, not by any
  "Dimensions:" label**. Matching a name that genuinely appears in the text is
  recognition, not inference.

Parsed free text must satisfy the **same completion check** as the form, and the
free-text mode must offer a **downloadable markdown template** — section headers
only, no pre-filled example values — matching whichever format applies to the
step.

### Parity check

Before a free-text parse is treated as complete, it must be run against the
fixtures at `apps/phase-0-single-topic/fixtures/rate-limiting/` — `topic.md`,
`sources-freetext-markdown.md`, and `personas-freetext.md` — and the parsed
result must match `expected-parsed.yaml` **exactly**: same number of entries,
same field values, dimensions matched correctly with no label present.

## The API key — asked for once, only when needed

The lab uses **your own API key** (BYOK). The key prompt is a **conditional
interrupt, not a step**:

- It appears **only when no key is set**, and never when one already is.
- It **never blocks navigation through Steps 0–3.**
- It is **not a permanent numbered step** in the sequence.
- A missing key **hard-blocks only Step 4 (Refract).**

The author sets a key via Settings if prompted.

## Refraction — bring your own key, provider-agnostic

The compiler takes **the topic text, the sources, and one persona** (`id`,
`name`, `summary`, `dimensions[]`) and returns **one refracted text**. It is
called once per persona — up to two calls per Refract action, since the action
covers every persona in one click but the compiler's own contract handles one
persona per call.

Its contract is **the same regardless of model provider** — Claude, Gemini, or
another. Nothing in the pipeline may depend on a specific vendor.

The compiler must never:

- **invent a value** not present in the topic text or sources — where something
  isn't specified, it says so explicitly rather than guessing,
- **add anything beyond what the persona's dimensions and the provided
  topic/sources call for** — no extra sections, no "you might also want to know"
  asides, no speculative suggestions about related topics not in the input. The
  output should be as short as correctly serving the persona's need allows,
- **reference, hint at, or imply material outside what was provided.** A correct
  disclosure states only what this input does or doesn't specify — never where an
  unspecified value might otherwise be found,
- **fail silently.**

### On a failed call

On a network error, rate limit, or malformed model response, the compiler
**automatically retries the exact same call once**, with no user action. If the
retry also fails, it returns a **structured error** — `{type:
network | rate-limit | malformed-response, message, retryable}` — and **surfaces
it to the author visibly** (not console-only). It never retries more than once,
never presents a failed call as a successful empty result, and **logs the raw
API response** on any malformed-response error so the failure can be diagnosed.

## Grounding — nothing ungrounded gets delivered

Grounding is a **gate on Step 5 (Publish)** — not its own step, and not part of
Refract. It runs automatically, once per persona, at the moment delivery is
requested for that persona; it is not a one-time check performed at Refract
time. This means grounding catches drift even if what's held in
`refractedOutputs` were somehow to change between the moment it was generated
and the moment it's requested.

Output containing an **ungrounded specific claim must not be delivered** — the
request instead returns a structured error, `{type: ungrounded-claim, message}`.
Facts that are **absent from the source material are stated as absent**, never
filled in.

This is a distinct governance check, layered on top of the compiler's own
"don't invent values" instruction and the system-level rule that no refracted
fact may be absent from the topic or sources. The same underlying constraint is
deliberately stated at three separate layers — the compiler's prompt, the
grounding gate, and the system-level rule — as three independent lines of
defense, not a redundancy to simplify away.

## Delivery — a reader picks a persona, nothing else

A delivery request carries **a topic id and a persona id**; the response is that
persona's refracted text, after it passes the grounding gate above. Delivery
must never:

- return **a different persona's output** than the one requested,
- return output for **a persona that hasn't been refracted yet** — instead it
  returns a structured error, `{type: not-yet-refracted, message}`,
- **ask the reader for a topic id.** The topic id stays in the underlying
  contract (for future multi-topic phases) but is **not a user-facing input**
  while the lab is single-topic; the app supplies the one existing topic's id
  automatically,
- **serve output that hasn't passed the grounding gate.**

The response comes from the refracted-outputs map, **keyed exactly by the
requested persona id**. The persona selector is the **only input the reader
sees.**

## Persona names in the UI — plain text only

Anywhere a persona's name is shown to any user — the Refract screen's output
list, the reader's persona selector, anywhere — display **only the plain name
text** (e.g. "First-time integrator"). Never leak the underlying data
structure's syntax: no quote marks, no YAML/JSON key names, no list-item dashes,
no raw internal identifier like "persona-0" appended to the name. If a
human-readable disambiguator is genuinely needed, use plain language.

## State — everything is in memory

All authored data — `topicText`, `sources`, `personas` (each with its `id`), and
`refractedOutputs` — lives **in memory for the current session only**. There is
**no persistence across a page refresh or a browser close** in this phase.

State must never be **lost or overwritten between steps**: navigating the steps
never clears anything the author entered; only an explicit author edit changes a
value.

> **Note.** Combined with the redirect-on-incomplete gating rule, a page refresh
> while on Step 4 discards all state and returns the author to Step 1. This is a
> direct, accepted consequence of the two rules, not a bug.

## What's explicitly out of scope

- Block catalogs.
- Multi-topic management.
- Custom dimensions.
- More than two personas per topic.
- More than one topic per lab instance.
- Persisting data beyond the current session.

## Visual identity

A consistent visual style — icons, colors, step-badge states, panel treatment —
matching an existing reference application's look and feel, **without importing
or depending on that application's codebase**. Styling values and icon assets
are **copied in as static files**; nothing loads from the reference app at
runtime. This is in scope for this build, alongside branding — both
`components/branding-rename.yaml` and `components/style-visual-theme.yaml` are
wired into `system.yaml`'s component list.

The styling pass applies only to the **existing three-panel layout and the step
navigation** — it does not restructure the layout, and it must not change any
pipeline logic, state handling, gating, or the refraction mechanism. Before any
visual change, what was found in the reference app (icon library, badge styling
values, sidebar treatment) is reported for confirmation. No new icon library or
dependency is introduced without first checking whether the reference app
already uses one that can be reused.

**Completed steps in the step nav get a filled background**, distinct from the
outlined treatment of the active step. Step numbers stay the clearest visual
element of each nav entry.

The app's **name and tagline come from `build-config.yaml`** (`branding.productName`,
`branding.tagline`), read from one source — never hardcoded, never duplicated as
a literal in more than one place. Before renaming, the codebase is searched for
any hardcoded prior product name (per `branding.priorNames`) in UI text, page
titles, and component/file names, and every occurrence is reported before
anything changes. Every file changed by the rename is reported so it can be
verified.

> **Known limitation.** `style.visual-theme` names the reference application by
> an **absolute local path** (`C:\Users\parth\ei\eisyntaxia_repos\syntaxia-studio`),
> which only resolves on the machine the spec was originally written on. A build
> run anywhere else falls back to reusing the already-committed design-system
> tokens rather than performing a fresh inspection of the reference app — this
> is accepted as a known gap, not yet fixed.

## Technology

Not stated in `specs/`. The technology and provider are named in
`build-config.yaml` (per `apps/shared/BUILD_INSTRUCTIONS.md`), not in the spec
itself. Several rules — matching "the existing Metadata form," running against
existing fixtures, scanning for a prior product name — assume the build extends
an existing codebase rather than starting from nothing.