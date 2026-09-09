# Design document — Phase 1: Publication with topics

## What this is

The progressive next step from `apps/phase-0-single-topic`. In place of a
single topic, the author works with a **publication** — five fixed topics,
sharing sources and personas, refracted together in one action.

This phase starts from a fixed fixture rather than an open-ended authoring
surface: the publication, its five topics, its sources, its variables, and
its personas are all pre-populated on load (matching Phase 0's own
pre-population pattern), and the author edits from there.

## The fixture

**Subject:** the AI-managed store promotions feature (extends Phase 0's own
fixture into a full publication).

**Five topics, flat — no nesting in this fixture:**
1. Introduction
2. How it works
3. Getting started (the technical detail behind the scenes)
4. Setting up your first promotion
5. Troubleshooting

**Two sources:**
- The original source, describing the AI-management *feature* generally
  (same content as Phase 0's fixture source).
- A second source, describing one *concrete promotion instance* — its
  discount, eligibility rule, expiry, and stacking rule. Gives topic content
  something real to reference, rather than staying abstract.

**Variables**, publication-level, `{{name}}` substitution inside any
topic's content:
- `product_name`
- `client_name`
- `promotion_name`

**Three personas, uncapped** (see "Personas" below):
- Generic user/creator
- Signed-in or registered user/creator — **this persona's Context
  dimension varies between first-time and returning use.** A first-time
  signed-in user and a returning one are the same persona, not two
  separate ones; the difference is expressed through Context (what the
  system already knows about them), the same dimension already governing
  every persona, not a fourth persona added to distinguish the two.
- Tech admin/developer

## Personas — no fixed count

Earlier phases capped personas at two. That cap was never a technical
constraint — it existed only to keep Phase 0's first proof small. Nothing
in the actual refraction mechanism (one compiler call per persona, one
entry in `refractedOutputs` per persona) depends on a small number. This
phase drops the cap entirely, matching how Topics already work: **however
many the publication needs.**

Personas can be **added, edited, and deleted** freely — the same full
editing parity Topics and Sources have. Deleting a persona does not warn
about or protect any refracted output tied to it; that output is simply
gone, the same way deleting a topic doesn't warn about losing its content.

## Editing — Topics are fixed; Sources, Variables, and Personas are not

**Topics are a fixed set of five, in a fixed order, for this phase.** No
add, no delete, no reorder — the five topics named under "The fixture" are
the whole set, permanently, in that order. Only each topic's own *content*
(the markdown text, its `source.onlyUse` and `refraction.personas`
settings) is editable — the topic list itself is not.

**Sources and Personas: metadata-editable, not add/delete, revised
from an earlier version of this document.** The three real personas and
two real sources built for this fixture are rich enough on their own —
recalibrating an existing persona's cognitive profile and watching
refraction shift is the more valuable thing to demonstrate in this phase
than adding a sixth persona. Sources and Personas can be edited in place;
adding or deleting either is out of scope for this phase.

**Variables remain fully open — add, edit, delete.** Unlike Sources and
Personas, variables are inherently open-ended (a new fact like a discount
code could come up at any time), so this phase keeps full editing parity
for them.

This is a deliberate asymmetry, not an oversight: the publication's
*structure* (which topics exist, in what order) is fixed for this fixture;
Sources and Personas are rich enough to explore through editing alone;
Variables stay fully open because new ones are a real, ongoing need.

## Source scoping and refraction scoping — on the topic

Two independent groups of fields live on each topic:

```yaml
topic:
  source:
    onlyUse: [source-id, ...]

  refraction:
    personas:
      onlyFor: [persona-id, ...]
      excludeFor: [persona-id, ...]
    # Future siblings, NOT built in this phase — named here so the
    # shape is ready to grow without restructuring later:
    # surface: ...   (the same Surface dimension already used for
    #                  personas, applied as a topic-level constraint)
    # tones: [...]
    # styles: [...]
```

**`source.onlyUse`** — by default, every topic uses every source in the
publication. `onlyUse` narrows a specific topic to a named subset. Sources
themselves have no awareness of personas or of each other — this is purely
"which of the publication's sources does this topic draw from."

**`refraction.personas.onlyFor`** — this topic is refracted *only for* the
named persona(s); every other persona doesn't see it.

**`refraction.personas.excludeFor`** — the inverse: refracted for every
persona *except* the named one(s).

**`onlyFor` and `excludeFor` are mutually exclusive.** A topic that sets
both is a Quality Check failure — not silently resolved by picking a
winner.

This fixture's five topics use neither field — all five are refracted for
all three personas, using both shared sources. The fields exist and are
built, ready for a topic that needs to diverge, but nothing in the fixture
itself requires it.

### Deferred to a future phase — Firebase/Firestore storage

Fixtures in this phase are stored as files on disk, named
`<slug>-<uuid>.md`, where the slug is derived from `title`. This
means a title change can require a file rename — the UUID inside
never changes, but its filesystem path does, since slug and identity
are tangled together on disk. A future phase may move storage to
Firestore (or similar), where the UUID becomes the document's real
key and `title` becomes a plain, freely-editable field with no path
implications at all — resolving this rename cost by construction,
not by additional schema work. Not built in this phase.

### `parts:` metadata — present in the fixture, deliberately unused

Every consolidated topic file in this fixture carries a `parts:` field
(each entry a `{schema, id}` pair, naming the real sub-topic files that
were concatenated to produce it). This traceability data is kept in the
files on purpose — it isn't removed — but nothing in this phase reads or
validates it. It exists for the part/whole validation mechanism deferred
to Phase 2, below, so that work doesn't need to regenerate fixture data
when it eventually happens.

### Deferred to Phase 2 — part/whole content validation

Topic content in this phase is flat, consolidated markdown — a title
and a body, nothing more. There is no forced sub-schema composition
(no required "parts" like introduction/purpose-and-overview/etc.),
no per-part `requirements` fields, and no validation that checks
individual parts and then the whole composed topic. That entire
mechanism was explored and prototyped during this phase's design
work, but it is real, additional scope beyond what this phase
actually needs — Phase 1 is about Publication, Topics, Sources,
Variables, and Personas at the structural level, not deep content
schemas per topic type. Moved to Phase 2.

### Parked, not built

**`excludeFrom`** was proposed as a topic-level field distinct from
refraction scoping — something structural, not persona-related. Its
actual meaning was never resolved, and it isn't needed for this phase.
Left undefined and unbuilt, the same treatment already given to Shared
Blocks and Templates in earlier phases.

**`refraction.surface` / `refraction.tones` / `refraction.styles`** —
named as the likely next siblings of `refraction.personas`, should a topic
ever need to constrain which dimensions apply to it, not just which
personas. Not built in this phase.

## The schema repository and `project.yaml`

Alongside this phase's own app, a separate, reusable **schema repository**
was built out during this phase's design work — `base.yaml` (shared
identity/lifecycle fields, including `authors`/`user`, every document
type extends this), `topic.yaml` (the real topic/publication shape —
a publication is a topic with `isPublication: true`), `persona.yaml`
(the full psycho-cognitive persona model), `source.yaml`, and a real
`project.yaml` that ties them together: one publication, plus the full
pool of topics/sources/personas/variables that exist in the project,
independent of which of them the publication currently references. This
repository is broader than what Phase 1's own app needs — it's shared,
reusable schema infrastructure, not something this phase's app directly
consumes end to end.

**Fixture data now lives in its own top-level `fixtures/` folder, a
sibling of `schema-repository/`, not duplicated inside it.** Phase 1's
actual fixture — the publication, its five topics, two sources, three
personas, and variables — is `fixtures/promotions/`: one real, validated
instance, referenced by this phase (and any future phase) rather than
copied into each. This starts as the convention from Phase 1 onward: new
fixtures get their own named folder under `fixtures/`, and the schema
repository itself never embeds a copy of fixture data again.

## Layout

Same three-panel layout as originally specified: Panel 1 (accordion —
Publication, Topics, Sources, Variables, Personas), Panel 2 (the generic
markdown/YAML editor, form or Metadata/Editor/Preview depending on what's
selected), Panel 3 (Guide + Quality Check). No modal dialogs anywhere in
this phase.

## Quality Check

Runs against the publication:
- Every topic has required metadata filled in (at minimum: a name).
- Every source reference used by a topic (`source.onlyUse`, when set)
  resolves to a real source in the publication's list.
- Every `{{variable}}` referenced inside a topic's content is defined in
  the publication's Variables list.
- A topic setting both `refraction.personas.onlyFor` and
  `refraction.personas.excludeFor` fails this check.
- At least one persona exists before refraction is allowed to run.

## Technology

Angular frontend.