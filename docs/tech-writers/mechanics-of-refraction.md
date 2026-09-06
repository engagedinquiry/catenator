# The mechanics of refraction

You don't write this part. But knowing what it is — and what it can produce — changes how confidently you use everything that came before it.

## Your governing document becomes a record, not a note

Everything you said — who's reading, what they already know, what they need, what happens if it goes wrong — gets turned into something structured. Not by you. Catenator reads what you wrote and builds a record out of it: a version of your understanding of the use-case that can actually be acted on, by a person or a system, without them having to guess.

Think of it the way a good style guide works, except one that's actually enforced rather than a PDF nobody opens after onboarding. You didn't write the enforcement mechanism yourself — but the guidance was always yours, and the record just makes it something nothing can quietly drift away from.

### Nothing goes in that you didn't already say

This record isn't invented. It's extracted — pulled directly from your governing document, your notes, the support tickets you've already noticed a pattern in. 

If something's missing, it's because you haven't said it yet, not because the system assumed something on your behalf.

### One record, several outputs

Once this exists, it can become different things, without you writing any of them separately:

- **A specification.** What keeps a guide accurate when the product changes — a record a developer or an AI system can check the guide against, so drift gets caught instead of discovered by a support ticket.
- **A guide for a beginner.** Full explanation, nothing assumed, including code examples customized for the reader.
- **A reference for an expert.** The command, without the walkthrough.
- **A client-installation-specific guide.** Content customized at different levels of expertise or need.

You made one thing. It doesn't have to be re-written twice to reach two different readers.

## Why this matters, even though you'll never touch it directly

Before this existed, your understanding of a use-case lived in exactly one place: your head, or a doc plan nobody reread once the writing started. Every guide you maintained by hand was a guide that could drift the moment the product changed and nobody told you.

This record is what stops that. Not because you're now required to notice every change yourself — you're not. Because what you already understood about your readers finally gets to stay understood, and stays checkable against what actually shipped.

### Specification

A specification is your record, turned into something that can be checked against the real product — every persona, every dimension you named, carried through intact. This is what catches the drift a static guide never could: if the product changes in a way that contradicts what you specified, that's visible, instead of silent until a reader hits it.

### Guide as deliverable

This isn't a one-way handoff into a PDF you publish and forget. What gets generated can be regenerated — reflecting whatever's currently true, not a snapshot from whenever the guide was first written.

You stay in the loop the whole way through: update your governing document when the product changes, and every variant of the guide updates with it — the beginner's version and the expert's version both, not just whichever one you remembered to go fix.

---

*Catenator is one way to change how you work, not the only way. It builds on* Design for the AI Era: Paradigm Shift *([Amazon](https://www.amazon.ca/Design-AI-era-Paradigm-shift/dp/B0H5FWQY7L)) — the book this whole standard grew out of and the standard evolves on.*