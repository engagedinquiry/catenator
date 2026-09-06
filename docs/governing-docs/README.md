# Catenator 

Not every system needs this. If your specs are small, stable, and read by exactly one team that already agrees on conventions, a good README and a consistent style are enough. This isn't solving a problem you have.

This is for the ones who've already built more governance than they get credit for — an ADR here, an API contract there, a schema for one service and a wiki page for another — and know none of it actually connects. Nothing traces a decision in one document to its consequence in another. Nothing stops the API contract and the ADR that justified it from quietly disagreeing six months later. You didn't lack discipline. You lacked one vocabulary that worked the same way across all of it.

And increasingly, your specs have a second reader you didn't design for. An AI agent building from your API contract, your schema, your architecture doc is doing exactly what a junior engineer used to do — inferring what wasn't stated, guessing at what "usually" happens, filling gaps with whatever's statistically common rather than what you actually meant. A junior engineer eventually learns your codebase's conventions. An agent starts over every time, from whatever's in its context window.

## What Catenator actually is, for you

Not a replacement for your ADRs, your OpenAPI specs, your existing conventions. A coordinate system underneath all of them — descriptors (what aspect of the system), views (what lens), -ilities (what quality bar) — so a rule in one part of your system and a rule in another are checkable against the same standard, instead of two different ad hoc formats that happen to both be called "documentation."

Existing standards aren't replaced. An OpenAPI contract still describes your API — Catenator wraps it, so a claim about that API is traceable and governed the same way a claim anywhere else in your system is, without you re-describing REST semantics in a new vocabulary.

## What this isn't

This isn't the plain-language version. If you want the schema, the actual YAML, the coordinate model in full — that's exactly what the rest of this folder is for, no simplification, no persona-friendly framing standing between you and the mechanism. The other four folders in this project exist so people who don't want this level of detail don't have to see it. You're the audience those folders were built to protect from exactly this page. Welcome to the actual thing.

**Catenator turns intent into something real, and makes sure what comes out can be trusted.**

You describe what you're making and who it's for — the content, the setting it'll be used in, how much it needs to be trusted, how it changes over time, how it should look and feel. Catenator shapes that into the right output for the right person, using a model of personas and dimensions covered under Refraction below. The same intent produces a different, correct result depending on who's receiving it.

**Creation** is governed and medium-agnostic. Nothing goes out ungrounded: every piece of output traces back to a real decision, policy, or source, and if it can't, it doesn't ship. This matters more, not less, as AI makes it easy to generate confident-sounding content that isn't backed by anything real. And it isn't limited to one kind of output — the same process works for code, documents, or something visual. What Creation produces is a system, described by a specification.

**Consumption** is only possible because creation was governed first. Handing someone control over ungoverned content isn't freedom, it's noise dressed up as choice. Once a system has been created properly, refraction can shape what it produces into a deliverable for a specific person — put into their hands, shaped for them specifically. Right now that looks like a reading experience where the reader is in control, instead of being handed one fixed version of a text.

A specification and a deliverable aren't the same thing. A specification describes a system. A deliverable is what refraction produces from it, for a given persona — a reading experience is one; more can be added over time.

That's the whole idea: govern what you create, shape it for whoever needs it, and only then hand it over.

---

## Three areas

Catenator is built around three things, each covered below.

- [Refraction](#refraction) — how intent becomes a specific, correct output for a specific person.
- [Schemas and specifications](#schemas-and-specifications) — how nothing ships without being authored, governed, and generated against something real.
- [Delivering with a paradigm shift](#delivering-with-a-paradigm-shift) — how a governed output actually reaches someone.

Refraction decides what something should become. Schemas and specifications make sure it's trustworthy before it goes anywhere. Delivery is how it actually gets to whoever needs it. Each depends on the one before it.

---

## Refraction

**Intent, shaped for whoever's receiving it**

Refraction is what happens to intent on the way to becoming something real — the same intent, shaped differently depending on who it's for, operationalized in the standard as the experience view. See [Refraction](refraction.md) for the full argument, including why intent itself isn't a field you fill in, but something already carried by how a thing is declared.

## Schemas and specifications

**Layers, wrappers, and what nothing else quite does**

A schema is the shape something is allowed to take: what fields exist, what type each one is, what's required, what's fixed once it's written. A specification is a schema filled in — a specific, structured statement of what's being built, not a description of it.

Specifications in Catenator nest rather than stack into fixed tiers. Every node is defined by two relative facts, not an absolute label: what it contains, and what it belongs to. A node that looks like top-level system intent from inside one spec can itself be a single dependency from the vantage point of a larger one — the schema doesn't assert which is "really" the top; it only records containment and dependency as they actually exist. Purpose and utility carry the structure that a fixed tier vocabulary would otherwise have to assert on top of it.

This kind of broad-to-narrow decomposition isn't new by itself — architecture frameworks and domain-driven design already do it. What's different is that every node here is governed, not just nested. A node deep in the structure doesn't just sit inside a larger one — it traces back to something real that authorizes it, the same way any claim does. Structure alone doesn't guarantee that; a well-organized nesting can still hold an ungrounded claim.

**The structure doesn't replace domain standards — it wraps them.** A node describing an API doesn't need its own vocabulary for REST semantics; it can state that it follows OpenAPI 3.3 and point to that spec directly. The wrapper is what makes the claim traceable and governed, regardless of which vocabulary describes the thing itself. Catenator isn't competing with OpenAPI, a design system, or a style guide — it's the connective layer holding them together, always present, not a fallback used only where nothing better exists.

Governing is what makes any of this trustworthy rather than just organized. Every claim, at every level of nesting, has to trace back to something real — a decision, a policy, a source. A claim with nothing behind it, or backed by something since retired, doesn't get written in. This holds at the level of each individual field, not just the structure as a whole. Boundary definition is itself a governed claim: where a node sits, what it contains, what it depends on, isn't given for free by the schema — it's a decision like any other, and it carries the same requirement. The schema doesn't presuppose who has authority to draw a boundary. It requires that wherever one was drawn, there's a traceable reason for it.

Generation is what happens once a governed specification exists: code, a document, an asset, built from the specification rather than from a fresh interpretation of the original intent. Because governance constrains what has to be true rather than how it must be expressed, generation isn't locked to a single fixed output produced once — the same governed specification can be generated at runtime, shaped for the moment and the person receiving it, without losing the grounding that makes it trustworthy. The schema doesn't enforce one way of doing things; it enforces that whichever way is chosen still has to answer to something real.

### What this structure buys you

**Traceability.** A claim's justification chain is visible — you can walk from a narrow, specific node up through what it belongs to, to the broader intent it ultimately serves. Nothing floats unattached.

**Compression.** Broad intent doesn't have to be restated at every level. Narrower nodes inherit context from what they belong to instead of repeating it.

**Isolation.** A change deep in the structure doesn't necessarily ripple upward, and a reverse index of what depends on a given decision makes it visible exactly what's affected before that decision changes — so a high-level revision doesn't happen blind to its consequences.

**Composability.** The wrapper model means external, well-established standards can be adopted wholesale at any point in the structure rather than reinvented — real leverage, not a from-scratch vocabulary for every domain.

**Reuse over authorship.** A node doesn't require full authorship to exist — it can start as a reference to something already known, a link, a reused decision from elsewhere in the system. Depth is added when it's earned, not required up front.

### What a schema does for you

You write down what you mean once, and it doesn't get reinterpreted every time someone — or something — acts on it. A developer, a stakeholder, and an AI agent reading the same specification arrive at the same understanding, not three separate guesses at what you probably meant.

You can hand off work without being in the room. Once something's governed, whoever picks it up next — a teammate, a different AI system, you in six months — builds from what was actually decided, not from reconstructing it out of old conversations and half-remembered context.

You can change one thing without losing track of what else depends on it. Because the structure records what belongs to what, a decision can be revised with visibility into its consequences, instead of a change quietly breaking something three steps removed that nobody thought to check.

You don't have to start from nothing. A node can point at what already exists — an established standard, a decision made elsewhere in the system, a link — instead of requiring everything to be authored fresh before it counts.

You get to trust what you're looking at. A specification isn't just organized, it's grounded — so reading it tells you not only what was decided, but why, and on what authority.

## Delivering with a paradigm shift

**Vrit — where governance happens locally, not on a server**

Vrit is the clearest example of what governed, personalized delivery actually looks like once it's built: the reader's context — what they've read, where they are in it, what they need next — stays with the reader. It's never transmitted to a server and used to decide what version of the text they're allowed to see. The device governs the experience, using context that never leaves it.

This matters because the alternative — a server deciding what to send based on a profile it holds — is still just one version of a page, chosen for you rather than governed by you. Vrit inverts that: the content arrives as raw material, ungoverned by any server's assumptions about who you are, and is shaped into your specific experience locally, by you, in a way that's consistent with the governance rules Creation already established. Client-side intelligence has made server-controlled rendering obsolete — Vrit is what that looks like as an actual delivery, not just an architectural claim.


---

*Catenator is a developing standard. What's written here reflects where the thinking stands today — expect it to change, sometimes without reconciling neatly with what came before. Contradictions between documents, or between a document and an earlier version of itself, are evidence of the standard evolving, not errors to apologize for.*