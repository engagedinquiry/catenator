# Schemas and specifications

A specification is usually one of two things: prose a human interprets, or a rigid, domain-specific format (OpenAPI, a database schema) that only covers one narrow slice of a system and says nothing about whether its contents are actually trustworthy.

Catenator proposes a third thing: a structured description of intent itself, examined through descriptors, views, and -ilities — a coordinate space, not a single fixed hierarchy. Existing domain standards aren't replaced by this; they compose with it, so an OpenAPI spec or a design system can be referenced from within a Catenator spec without needing to be redescribed.

## Why Catenator? Why now?

This is possible, and necessary, only because large language models exist. Not "AI" as a general gesture — specifically, models capable of reading unstructured prose and extracting structured claims from it, reasoning across descriptors that depend on each other, and proposing completions a human then confirms or rejects rather than authors from nothing.

Before this capability existed, a thirteen-descriptor coordinate model would have been a taxonomy for a person to fill in alone, one blank at a time, in whatever order a form imposed — exactly the rigid, linear authoring this standard is built to avoid. 

And on the other end, a spec is written for an agent to read and act on structurally, not for a person to interpret — which requires an agent capable of consuming that structure and determining what to build from it, without a human translating intent into instructions first.

Neither side of this is a convenience. Both are load-bearing: remove either one, and there is no reason a Catenator spec should exist in this form rather than as a PRD, a README, or a prompt.

Catenator is not a methodology that AI happens to make easier. It's a standard that has no reason to exist without AI as the thing that authors alongside a person and the thing that builds from what's authored.

## Top-line outline of a schema

At its simplest, a Catenator schema is written using descriptors — one identity statement, plus twelve lenses for examining what that identity actually consists of.

```
schema
├── identity     — what this is, in one or two sentences
├── domain       — the vocabulary and rules governing it
├── model        — the data structures it operates on
├── component    — the discrete, reusable pieces it's made of
├── service      — the capabilities it exposes or consumes
├── operation    — the individual operations it performs
├── actor        — who or what interacts with it
├── event        — what it must respond to
├── rule         — internal or external constraints it must enforce
├── process      — the workflows it executes
├── integration  — its boundaries with external systems
├── utility      — what it does for whom and to what end
└── risk         — what can go wrong, how likely, who bears it
```

No descriptor is mandatory. Use what the system requires.

Before writing a schema, answer these questions about the system. Each maps to one descriptor — answering all of them gives you the raw material a spec is built from.

- What is this, as a whole, in one or two sentences? — identity
- What field or world does this belong to, and what rules already govern that world? — domain
- What does this do, for whom, and to what end? — utility
- Who, or what, interacts with this? — actor
- What are the discrete, reusable pieces it's made of? — component
- What data or content structures does it operate on? — model
- What capabilities does it expose to others, or consume from them? — service
- What individual actions does it perform? — operation
- What workflows does it execute, step by step? — process
- What must it respond to — actions, triggers, changes, whether they come from inside or outside it? — event
- What constraints, internal or external, must it enforce? — rule
- Where does it meet other systems, and what are the boundaries there? — integration
- What can go wrong, how likely is it, and who bears the consequence? — risk

These questions aren't independent, and they don't have to be answered in this order. Naming an actor usually drafts a candidate event or rule before either is asked about directly. Naming a process usually drafts candidate operations, and often a rule about what makes the process fail partway through. Risk is the one descriptor that mostly can't be answered up front — it's sharpest when asked again, per actor and per process, once those already exist to fail.

## How to write the schema

Start at whatever scope you're actually working at — a whole system, a single feature, a page of writing. There's no required starting altitude.

**Answer identity first, and keep it short.** One or two sentences. If it takes a paragraph to say what something is, it's probably two things, not one.

**Don't fill in descriptors in a fixed sequence.** Because the questions surface each other, describe things in whatever order they come to mind, and expect earlier answers to draft candidate answers to later ones — confirm, edit, or reject what's drafted rather than authoring every descriptor from a blank state.

**Use only the descriptors the system actually needs.** A descriptor with nothing to say isn't a gap to fill — it's evidence that descriptor doesn't apply here.

**State a rule, event, or risk as a checkable claim, not a description.** "Handles authentication" is a description. "Requires a signed bearer token on every call" is a claim — specific enough that something could point at it and say it's true or false.

**Reach for an existing standard before writing a new descriptor from scratch.** If what you're describing already has a good external standard — an API, a design system, a documented convention — reference it directly. Write original claims only for what that standard doesn't already cover.

**Leave a descriptor minimal if that's all it needs.** A rule, a component, an integration point — none of these require elaboration until there's an actual reason to add more. Depth is earned by what needs deciding, not owed by default.

## Harnessing the model

The authoring workflow is not "describe your system to an AI and see what comes out." It's more specific than that: provide an LLM with the plain-language documents that already exist about a system — PRDs, briefs, emails, meeting notes, old documentation — and have it convert them into a Catenator schema, using the standard's own vocabulary rather than inventing its own.

The model isn't asked to understand the system from scratch. It's asked to re-express what's already been said, using descriptors, views, and -ilities as the target vocabulary instead of whatever loose structure the source documents happen to have.

A rule buried in paragraph four of an old email becomes a `rule` node.

A constraint mentioned once in a Slack thread and never written down again becomes a checkable claim instead of institutional memory. The model's job is extraction and translation, not invention — which is also why `display-name-source: inferred` exists as a field: the standard already expects and names the distinction between what a human explicitly said and what the model proposed on its own.

This is also the practical argument for why the format is worth the up-front cost. A YAML schema, or a rendered graphic of one, is faster to actually read than the reams of source material it was built from.

A reviewer scanning a spec's `rule` and `risk` entries is doing in minutes what would otherwise mean re-reading every PRD, doc, and email that ever touched the subject, hoping to remember where each constraint was mentioned.

The schema doesn't just organize the source material. It makes the source material something a person can stop having to re-read.

> Structured content loses less when transformed. A named field survives a transformation intact. A paragraph has to be re-read and re-interpreted each time, and each re-interpretation is a place where something can quietly drop out.

> Structure makes transformation traceable — what something became, and from what it was derived.

> Provenance isn't one field. It's a property the structure gives you throughout, not a checkbox you turn on.


---

*Catenator is a developing standard. What's written here reflects where the thinking stands today — expect it to change, sometimes without reconciling neatly with what came before. Contradictions between documents, or between a document and an earlier version of itself, are evidence of the standard evolving, not errors to apologize for.*