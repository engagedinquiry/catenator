# Catenator

Not every knowledge system needs this. If what you built answers simple, low-stakes questions and being wrong once in a while costs nothing, that's a reasonable thing to have shipped as-is.

This is for the ones who've noticed the actual problem: your system answers everyone the same way, confidently, whether or not it should. A new employee and a ten-year veteran ask it the same question and get the same paragraph back — not because that's correct, but because nothing in the system knows there's a difference. Worse, sometimes the answer is wrong, stated with exactly the same confidence as when it's right, and there's no way to tell which one you're looking at until someone downstream catches it.

You probably didn't choose this outcome on purpose. Most of these systems got built fast, because everyone else seemed to be shipping one, and the actual questions — who is this for, what should it refuse to guess at, how do we know an answer is grounded in something real — never got asked before launch.

## The answer was never supposed to be one thing, for everyone, at once

A knowledge base has readers with real, different relationships to the information in it — a new hire who needs the answer explained, a specialist who needs the exception noted, a customer who should never see the internal caveat at all. Most systems collapse all of that into a single response, generated the same way regardless of who's actually asking.

The failure isn't that the model doesn't know enough. It's that nothing about the question includes who's asking, and nothing about the answer says what it's actually grounded in. Fluent and correct look identical from the outside.

## What actually changes

Say what you already know about who's asking and what they're owed — not a new interface, just plainly: who's likely to ask this, what they already have access to, what an answer needs to be traceable to before it's trustworthy, what the system should say instead of guessing.

*"An employee asking about the refund policy should get the current policy, cited to the actual document. A customer asking the same question should get a simpler answer, with nothing internal-only leaking through."*

That's a persona, stated the way you already think about your users. From here, the same underlying knowledge becomes two different governed answers — not by writing two separate bots, but by refracting one governed source differently depending on who's asking and what they're allowed to know.

## Fast retrieval was never the missing piece

There's a version of "fixing" this that isn't actually fixing it: bolt on a better retrieval step, a bigger context window, a newer model, and call the trust problem solved because the answers come back quicker or read more fluently. A more fluent wrong answer is still wrong — it's just more convincing about it.

What was missing was never speed. It was a governed understanding of who's asking, and a real claim about what an answer is grounded in, checkable rather than assumed.

---

*Catenator is one way to change how you work, not the only way. It builds on* Design for the AI Era: Paradigm Shift *([Amazon](https://www.amazon.ca/Design-AI-era-Paradigm-shift/dp/B0H5FWQY7L)) — the book this whole standard grew out of and the standard evolves on.*