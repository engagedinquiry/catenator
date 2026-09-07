# Refraction

## Intent doesn't need its own field

A schema describing a system doesn't require intent as an explicit field, because the schema as a whole already carries it — every descriptor, every rule, every declared piece feeds into what the system is for. You don't add intent to a schema; the schema is already a description of it.

Intent cannot be stated without an owner. "This component's intent is X" is incomplete — intent belongs to someone or something: the person who created it, the system running it, or the organization that owns it once it's running. These aren't fixed roles. Intent transfers. A developer's intent is what gets built in; once a system is running, the intent is the system's own, independent of any one developer's current wishes; and it can transfer again, upward, to whoever owns the system. Most of the time, none of this needs to be traced explicitly — only when there's an actual reason to (drift, dispute, a handoff) does naming the owner earn its place.

Some descriptors already ask an intent question as part of their own definition. `utility` — what a system does, for whom, and to what end — already is an intent question; nothing needs adding to it. Others, like `model` or `integration`, don't surface intent the same way just by being described. This is uneven by design, not a gap: intent shows up where a descriptor already implies it, and is elaborated on further only when it's relevant. Forcing it everywhere produces noise, not clarity.

## Persona is not an actor

A system has actors — who or what interacts with it, a fact about the system, described the same way any other descriptor describes it. A system does not have personas. Persona belongs entirely to Refraction, not to the schema describing the system: it's an authored, governed representation of intent, deciding how something should be shaped for whoever receives it.

An actor and a persona can point at the same real person. But an actor is a fact about the system; a persona is an authored decision about how to shape what that person receives. Confusing the two would mean treating a description of the system as though it were a decision about delivery — a category error this standard is built to avoid elsewhere.

## Why refraction?

> **Intent** — what a declaration already asserts the moment something is named as what it is. Not a field you add to a schema. Always belongs to someone: a creator, a running system, or the organization that owns it.

> **Deliverable** — the output of refraction, produced for a persona. A reading experience, a document, a graphic. Not the system itself, and not the specification that describes it.

A system doesn't have one correct way of being experienced. The same underlying intent means something different depending on who's encountering it — and that difference isn't noise to be smoothed over. It's the actual work of designing anything for someone.

Refraction is the name for that necessity: intent has to pass through something that separates it into what's specific to the person receiving it, the way a prism separates light into what was already present, not something added to it. Without that separation, intent doesn't arrive as anything in particular — it arrives undifferentiated, the same thing handed to everyone regardless of who they are.

## Why refraction, why now

Before this was possible, refraction per persona meant one of two things, both bad. Either every persona's version was authored by hand in advance — static, expensive, and falling behind the moment personas multiply or intent changes. Or a server held a profile and decided what to send based on it — which isn't refraction at all, it's a guess made on someone's behalf, by something that isn't them, using data they don't control.

That second option is exactly the model [Delivering with a paradigm shift](delivering-with-a-paradigm-shift.md) already argues against.

What makes real refraction possible now is a system capable of shaping a deliverable per persona computationally, at the moment it's needed, rather than requiring every variant to be pre-authored or every decision to be made by a profile-holder on the persona's behalf.

That's what lets refraction happen on the fly, locally, governed — not guessed at by a server, and not limited to whatever variants someone thought to author in advance.

## Refraction turns on persona

Refraction has one primary axis: **persona** — who this is for. Not a demographic, not a segment. A governed description of intent, authored before anything is shaped. Everything else is a dimension of what gets shaped once the persona is known, not a peer to the persona itself.

A system with three personas has three refracted deliverables, one for each — composing into a governed whole, not one generic output that every persona extracts what they need from.

## Dimensions of the deliverable

Once a persona is established, refraction shapes the deliverable along five dimensions:

| Dimension | Governs |
|---|---|
| **Surface** | the rendering surface and its constraints — a capability context, not a pixel width. For digital experiences, this is the screen. Surface governs two things within it: **layout** (the named interface configuration active for this persona) and **hierarchy** (the arrangement of content and components by prominence, weighted by this persona) |
| **Context** | what the system knows about the persona before they act |
| **Content** | the governed arrangement of content within the active state — what's present, to whom, under what rules |
| **Time** | how the system holds and forgets across a session and across return visits |
| **Trust** | the conditions the persona must satisfy before they act, and what the system must provide to meet them |

Not every deliverable uses all five. A reading experience leans on Surface and Time; a generated document leans on Content and Trust. Which dimensions matter is decided by the persona and the deliverable, not fixed in advance.

Experience is not decoration applied after a system is built. It's a governing condition, authored before the system exists — the same as a rule or a constraint. A system without these dimensions explicitly considered has still made those decisions; it's just made them implicitly, with no record of what was decided or why.

## Deliverable is what refraction produces

A deliverable is the output of refraction — of a system, a creator, or an experience, shaped for a persona. A reading experience, a document, a graphic: all deliverables. A specification is not a deliverable; it's what describes a system, produced by Creation, not by Refraction. The one exception is Catenator describing itself, which isn't the case in view here.

**Delivery is the act of getting a deliverable to someone.** Refraction decides what a deliverable should become for a given persona. Delivery is what actually puts it in their hands. They're related but distinct: refraction can happen ahead of a deliverable existing at all, and delivery can happen long after refraction already decided its shape.

## Experience in refraction

The `experience` view belongs in the schema — it's part of specifying and describing the system itself, the same as any other view. It states the governing conditions: what layout states exist, what trust conditions apply, how the system should hold and forget across a session. This is authored before the system exists, the same as a rule or a constraint — a system without an explicit experience view has still made these decisions, just implicitly.

In context of refraction, experience is different in kind, not just in name: it's the deliverable produced when those specified conditions are actually shaped for a given persona. 

> The schema's experience view is the specification. In refraction, experience is the instance — what a specific persona actually receives, consistent with what the schema specified, but not the specification itself.

The relationship is the same as any descriptor and what's generated from it: a `rule` is specified in the schema; enforcing it happens downstream. Experience is specified in the schema; producing it, per persona, happens in Refraction.

## Refraction isn't tied to one moment

Refraction can happen ahead of time — a deliverable shaped, checked, and approved before anyone asks for it — or on the fly, at the moment someone actually receives it. Both are the same mechanism; timing is a property of when it runs, not a different process.

For the deeper argument — why sameness-for-everyone is the wrong default, and the case for treating rendering itself as something that should happen locally rather than being decided for you by a server — see *Design for the AI Era*, where this is argued at length as part of the case for post-browser, on-device governance.


---

*Catenator is a developing standard. What's written here reflects where the thinking stands today — expect it to change, sometimes without reconciling neatly with what came before. Contradictions between documents, or between a document and an earlier version of itself, are evidence of the standard evolving, not errors to apologize for.*