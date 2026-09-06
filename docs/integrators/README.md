# Catenator

Not every integration needs this. If what you added answers questions your existing access-control already scopes correctly, and nothing sensitive can leak through regardless of what's asked, that's a reasonable thing to have shipped as-is.

This is for the ones who added AI answering to a system that already had real users, real roles, and real permissions — and then watched the AI layer answer everyone the same way anyway, as if none of that existed. Your product has known for years that an admin and a guest see different things. The chatbot you bolted on top of it doesn't know that at all. It answers from the knowledge base directly, blind to the access control sitting one layer below it.

You didn't design it this way on purpose. The AI layer got added fast, as its own thing, wired to the knowledge base but never actually wired to the permission system your product already enforces everywhere else. Nobody asked whether the new layer should inherit the rules the old one already had. So it didn't.

## The gap isn't the AI. It's that it forgot what your system already knew.

Your product already has an answer to "who is this person and what can they see." It's in your roles table, your permission checks, your access scopes — enforced everywhere, except in the one place that's newest and talks the most confidently: the answering layer. That's not a limitation of the model. It's a wiring gap. The governance already existed. It just wasn't connected.

## What actually changes

Say what your system already enforces, in your own words, and connect it to how the AI layer answers.

*"An admin asking about a customer's account should see everything, cited to the record. A support rep asking the same question should see what their role already permits, and nothing past it."*

That's not a new persona system — it's the one you already have, stated so the answering layer can actually use it. From here, the same underlying knowledge answers differently, correctly, per role, because the roles were never the missing piece. Connecting them was.

## A better model doesn't fix a wiring gap

Upgrading the model, tuning the prompt, adding a bigger retrieval window — none of it touches the actual problem, because the actual problem was never about model quality. It was about whether the answering layer even asks who's asking before it answers. A smarter model with the same gap just answers wrong, more fluently.

---

*Catenator is one way to change how you work, not the only way. It builds on* Design for the AI Era: Paradigm Shift *([Amazon](https://www.amazon.ca/Design-AI-era-Paradigm-shift/dp/B0H5FWQY7L)) — the book this whole standard grew out of and the standard evolves on.*