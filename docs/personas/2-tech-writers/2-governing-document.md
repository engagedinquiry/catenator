# Governing document

You don't need to understand a schema, a descriptor, or a coordinate model to write one. You need to answer the same questions you already ask before you write any real guide — just answer them somewhere that holds onto what you said.

## Start with the use-case you already know

Before anything else, say who's hitting this and why, in your own words. Not a template. A sentence or two, the way you'd describe it to another writer.

*"A first-time user seeing this error has no idea what a webhook is. An admin seeing the same error already knows, and just needs the retry command."*

That's it. That sentence already contains a persona (first-timer, admin), an intent (explain versus get them moving fast), and the beginning of a governing document. Nothing about it needed translation.

## The persona at the top of your doc plan was never real

If your docs process has a "target audience" section — one paragraph at the top of a template, filled in once, never referred to again while you actually write the steps — you've made the kind that decorates a header, not the kind that governs a guide. It gets written to satisfy the template. The steps get written the same way regardless of who's supposed to be reading them.

That's not a failure of effort. It's a failure of position. A persona stated once at the top and never returned to can only describe — it was never built to decide anything about what comes after it.

> A persona governs or it decorates. There is no middle position.

Here's what governing actually looks like: name who this is for *before* you write a single step, and let every step answer to it. Not "first-time user" as a line at the top — "first-time user" as the reason this step gets an explanation and that step doesn't, as the reason this guide starts with context an admin would skip past.

## Say what matters, for each reader

For each persona, answer what actually changes:

- What do they already understand, coming in?
- What do they need explained versus what can you assume?
- Do they need the full procedure, or just the one command that gets them unstuck?
- What happens if they get this wrong — and does that change what you owe them here?

You're not filling in a template with required fields. You're doing what a good use-case always required — deciding, on purpose, what's actually different about this reader before you write a single step for them.

You are creating a document describing the use-case, not the product. That document doesn't have to be prose from the start — a voice note, a support-ticket pattern you've noticed, a rough outline of the steps, can all be the beginning of it.

## Let it hold what you said

Once you've said this, it's recorded — not a doc plan that gets abandoned the moment the actual writing starts, but a governing document that survives being handed to a developer, an AI system, or you in six months, having forgotten why you structured the guide this way.

This is the part that used to happen anyway, in a good documentation process — a use-case that preceded the steps, that anyone could point back to when someone asked "wait, why does the guide explain this part and not that one?" You're not adding a step. You're making sure the step you already did doesn't evaporate the moment the writing starts.

## Watch it become different guides

From the same governing document, without you writing it twice:

- A first-timer gets the explanation, in order, with nothing assumed.
- An admin gets the command, without the explanation they don't need.
- A developer or an AI system gets a specification precise enough to keep the guide accurate when the product changes — without you having to notice the drift yourself.

You made one governing document. It becomes different guides depending on who's receiving one — the same way a good use-case always let a beginner and an expert walk away with what they actually needed, without you maintaining two manuals by hand.

## What you don't have to do

You don't have to learn descriptors, YAML, or a coordinate model to write a governing document. That's the machinery underneath — built for people who build the tools, not for the people the tools are built for. If you're curious how it actually works under the surface, it's documented, and you're welcome to it. But nothing above requires it.


---

*Catenator is one way to change how you work, not the only way. It builds on* Design for the AI Era: Paradigm Shift *([Amazon](https://www.amazon.ca/Design-AI-era-Paradigm-shift/dp/B0H5FWQY7L)) — the book this whole standard grew out of and the standard evolves on.*