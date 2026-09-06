# The mechanics of refraction

## Your spec becomes a checkable record, not prose

A claim stated in your governing document is extracted into a structured record — the actual coordinate-model entry, with a descriptor, a view, and whatever -ility applies. This isn't a summary of what you wrote. It's what you wrote, in a form that can be checked programmatically rather than read and trusted.

### Nothing is inferred that you didn't state

If a precondition is missing from the record, it's missing because it wasn't in your claim — not because the system assumed one. An ungrounded or unstated claim doesn't get filled in; it's flagged as absent.

### One record, multiple consumers

- **A human-readable spec.** For a maintainer, with context assumed appropriately.
- **An agent-executable contract.** For a build system or coding agent, with every precondition and failure state explicit.
- **A validation check.** The same claim, running against the live system to confirm it still holds.

You state the claim once. It's consumed differently depending on who or what is reading, without three separate documents to keep in sync.

## Why this matters

Before this, a claim's accuracy was a matter of trust — trust that the ADR was updated, trust that the API contract still matched the implementation, trust that nothing drifted since the last review. This record replaces trust with a check. Not because you're now required to be more careful than before — because what you already stated stays checkable against what's actually true, instead of degrading into institutional memory the moment the person who wrote it moves on.


---

*Catenator is a developing standard. What's written here reflects where the thinking stands today — expect it to change, sometimes without reconciling neatly with what came before. Contradictions between documents, or between a document and an earlier version of itself, are evidence of the standard evolving, not errors to apologize for.*