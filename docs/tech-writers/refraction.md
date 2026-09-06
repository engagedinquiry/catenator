# Refraction

Don't let it just sit there. Make it work.

## What you always knew about your readers

You always knew a first-time user and a returning admin shouldn't read the same paragraph. You've felt the tension every time you had to choose: write for the beginner and bore the expert, or write for the expert and lose the beginner at step one. Most guides just pick one and disappoint the other reader quietly, guide after guide.

Your instinct that these are different readers, needing different things, was never wrong. It just never had a way to actually run — not without maintaining two separate manuals by hand, and nobody was ever going to give you the time to keep both current at once.

## Every use-case gets its variant

The guide you wrote can be shaped for every reader who hits this use-case, not just the one you had time to write for. Each variant is answering a genuinely different question — not the same paragraph reworded, a different starting point entirely, because a beginner and an expert aren't asking the same thing even when they're stuck in the same place.

> AI makes every variant possible and achievable. Suddenly, the writing itself is the constraint. It is a strange liberating feeling.

## It gets shaped, per reader

Every persona you named gets its own version of the guide — not because someone copies your governing document and edits it by hand, but because the document is precise enough to be reshaped automatically for whoever's reading.

This is called **refraction** — the same governing document, separated into what's actually relevant for each reader, the way a prism separates light into what was already there. Nothing gets added that you didn't already put in. It's your understanding of the use-case, sorted by who's asking.

## What actually changes, per reader

For tech writing, these dimensions don't carry equal weight the way they might for a visual design. Surface — how it's laid out, what it looks like — matters least here; a guide's real work happens in the other four.

| Dimension | What it means for you |
|---|---|
| **Context** | What they already know, coming in. A first-timer and an admin aren't arriving with the same background — one needs the concept explained, the other needs to skip straight past it. |
| **Content** | What's actually included. The same underlying use-case can lead with the explanation or lead with the command, depending on who's reading. |
| **Time** | What's remembered from earlier in the guide, or from earlier visits. An admin returning to a familiar procedure doesn't need to be re-oriented every time. |
| **Trust** | What they need confirmed before they'll act on this. A beginner may need reassurance this won't break anything. An admin just needs to know it's current. |
| **Surface** | How it's laid out on the page — present, but rarely where the real difference between readers actually lives. |

You already answered most of this when you said what matters for each reader. Refraction is just the name for what happens when those answers are actually put to use.

### Which dimension is actually driving your problem

Not every documentation challenge stresses the same dimension. Knowing which one you're actually dealing with saves you from over-solving with the wrong tool.

**Multiple installations, same product.** Context is your driver. The reader's expertise might be identical across every client — what's different is what's true where they are. If your guides keep needing "except for clients using X" caveats scattered through the text, that's Context asking to be named explicitly, not worked around in prose.

**Docs that go stale fast.** Time is your driver. If your real problem is "this was accurate in March and nobody's sure if it still is," you don't need a new persona or a rewritten dimension table — you need the freshness mechanism itself, the one that lets a guide reflect what's true now instead of what was true when it was written.

**Beginner versus expert.** Content and Trust are your drivers together. Content decides what's included and in what order; Trust decides what needs reassuring versus what can be stated flatly. These two rarely move alone — a beginner usually needs both more content and more reassurance at once, which is why they're named as a pair here rather than separately.

This isn't a rule that only one dimension is ever active. Most real guides are dealing with two or three of these problems layered on top of each other — an admin at a specific installation, reading documentation that changes weekly. The point of naming the driver isn't to isolate a single dimension. It's to know which one to check first when a guide isn't working, instead of guessing.

### Context carries more weight than it looks like it does

Context isn't only about expertise level. It's about everything the reader is already standing inside of when they arrive — and for a lot of real documentation, the biggest part of that is which installation they're actually using.

An admin at one client's installation and an admin at another aren't the same reader, even though "admin" sounds like one persona. One has a certain integration enabled and the other doesn't. One calls a feature by a name your product team picked and the client renamed for their own users. Same expertise level, same role, genuinely different context — because the guide has to answer to what's actually true for *their* installation, not a generic version of the product that matches nobody's.

This is why a persona is never just a role. "Admin" isn't a full persona on its own — "admin, at this specific installation, with these integrations active" is. Leave the installation out, and you've written a guide that's technically correct for no one in particular.

## An agent is a persona, not a bigger version of one

When one of your personas is an agent — something reading the guide to act on it, not a person reading to understand it — the difference isn't that it needs more.

> AI agents cannot tolerate things left unstated or overstated.

A human reader infers what you didn't say. They'll notice something feels off, pause, ask someone. An agent generally can't.

So an agent persona doesn't get an exhaustive guide covering every case at once — it gets the same use-case, refracted the way any persona's is, except wherever a human variant could stay casual, the agent variant has to be precise: the exact precondition, the exact failure state, the exact thing to check before acting, made explicit instead of assumed.

This is still refraction, not a special case of it. The dimension doing the real work here is usually **Content** — what's actually included changes shape, not just length. A human variant can say "make sure the export finished before archiving." An agent variant needs the actual check.

Don't confuse this with writing more. An exhaustive, everything-included guide isn't a better agent variant — it's the return of the single, undifferentiated guide this whole approach replaces, just longer.

The agent persona needs precision where a human persona tolerates ambiguity. It doesn't need everything.

## Refining is normal — expected, even

You're not locked into what you wrote the first time. If a reader's version doesn't feel right once you see it, that's not a failure of the process — it's the process working. Go back to the governing document, adjust what you said about that reader, and the shaped version updates from there.

This is different from the old way, where changing your mind meant rewriting the guide from scratch, or maintaining a second manual that quietly drifted from the first. Here, the governing document is still the one thing you're editing. Everything downstream follows it.

## The test for whether it's working

If you look at what a reader receives and can't point back to something you actually decided — a persona you named, a preference you stated — that's a sign the governing document needs another pass, not that refraction did something wrong.

Ask it plainly, every time you review a variant: *why does this reader see this, in this order, with this much explanation?* There should be an answer, and it should be yours. "Because a first-timer wouldn't know this term yet" is yours. "I'm not sure, that's just what came out" is the signal something's missing upstream.

---

*Catenator is one way to change how you work, not the only way. It builds on* Design for the AI Era: Paradigm Shift *([Amazon](https://www.amazon.ca/Design-AI-era-Paradigm-shift/dp/B0H5FWQY7L)) — the book this whole standard grew out of and the standard evolves on.*