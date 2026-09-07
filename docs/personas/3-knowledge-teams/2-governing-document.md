# Governing document

You don't need to understand a schema, a descriptor, or a coordinate model to write one. You need to answer the same questions you already ask about who uses your knowledge base — just answer them somewhere that holds onto what you said.

## Start with who's actually asking

Before anything else, say who asks this kind of question and what they're owed, in your own words. Not a permissions matrix. A sentence or two, the way you'd explain it to a new team member.

*"An employee asking about the refund policy should get the current policy, cited to the actual document. A customer asking the same question should get a simpler answer, with nothing internal-only in it."*

That's a persona (employee, customer), a trust requirement (cited versus simplified), and the beginning of a governing document. Nothing about it needed translation.

## Most systems never had a persona field at all

This isn't the fake-template problem other teams have — a "target audience" line filled in once and ignored. Most knowledge systems never had that line in the first place. There was no field for "who's asking," decorative or otherwise. The system just answers "the user," singular, undifferentiated, because nobody built anywhere to say it should do otherwise.

> An answer with no stated persona isn't neutral. It's answering everyone as if they were the same person, which is nobody in particular.

Here's what governing actually looks like: name who's likely to ask, before you decide what the system is allowed to say back. Not "users" as a category — "employee" and "customer" as two different reasons the same question gets asked, each owed something different in return.

## Say what matters, for each asker

For each persona, answer what actually changes:

- What are they allowed to know, and what should never reach them?
- What does an answer need to be grounded in before it's trustworthy for this asker?
- What should the system say instead of guessing, when it doesn't actually know?
- Does this asker need a citation, or just a confident, simple answer?

You're not filling in a permissions form. You're deciding, on purpose, what's actually different about this asker before the system is allowed to answer them at all.

## Let it hold what you said

Once you've said this, it's recorded — not a policy doc nobody rereads after launch, but a governing document that survives being handed to an engineer, an AI system, or you in six months, having forgotten why the customer-facing answers look different from the internal ones.

## Watch it become different answers

From the same governing document, without you writing separate bots:

- An employee gets the cited, complete answer.
- A customer gets the simplified, safe version, with nothing internal leaking through.
- An answer the system can't ground gets refused, instead of guessed at with false confidence.

## What you don't have to do

You don't have to learn descriptors, YAML, or a coordinate model to write a governing document. That's the machinery underneath. If you're curious how it actually works, it's documented. But nothing above requires it.