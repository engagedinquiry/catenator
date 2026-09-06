# Governing document

You don't need to understand a schema, a descriptor, or a coordinate model to write one. You need to write down what your system already enforces — just somewhere the answering layer can actually see it.

## Start with the roles you already have

Before anything else, name a real role in your system and what it's actually allowed to see, in your own words.

*"An admin asking about a customer's account should see everything, cited to the record. A support rep asking the same question should see what their role permits, and nothing past it."*

That's a persona (admin, support rep), a trust boundary (full record versus scoped record), and the beginning of a governing document. You didn't invent this — it already existed in your product. You're just writing it down where it can govern the answering layer too.

## The persona your AI layer is missing isn't new. It's already in your database.

Unlike a system built from scratch, you don't need to invent who your users are. Your roles table already has them. The gap isn't imagination — it's that the answering layer was never told to check it.

> An AI layer with no persona check isn't neutral. It's answering as if the role table doesn't exist, even though every other part of your system checks it constantly.

## Say what matters, for each role

For each role already in your system:

- What does this role already see, according to your existing permissions?
- Does the AI layer currently check that, or does it answer blind to it?
- What should the answer refuse to include, regardless of how the question is phrased?

## Let it hold what you said

Once this is recorded, it's not tribal knowledge sitting in your permissions code that only your access-control layer understands. It's a governing document the answering layer can actually check against, the same way your API already does.

## Watch it become different answers

From the same governing document:

- An admin gets the full, cited answer.
- A support rep gets the scoped answer their role already permits.
- A question that would leak past a role's actual permission gets refused, not answered around the edges.

## What you don't have to do

You don't have to learn descriptors, YAML, or a coordinate model. That's the machinery underneath. But nothing above requires it.


---

*Catenator is one way to change how you work, not the only way. It builds on* Design for the AI Era: Paradigm Shift *([Amazon](https://www.amazon.ca/Design-AI-era-Paradigm-shift/dp/B0H5FWQY7L)) — the book this whole standard grew out of and the standard evolves on.*