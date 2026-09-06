# The mechanics of refraction

You don't build this by hand. But knowing what it is changes how confidently you rely on it.

## Your governing document becomes the bridge your system was missing

Everything you said about roles and permissions gets turned into a record the answering layer actually checks — not duplicated logic, a connection to what your access-control layer already enforces.

### Nothing goes in that you didn't already have

This isn't a new permission system. It's your existing one, made visible to the part of your system that was never checking it.

### One record, several outputs

- **A grounded answer for one role.** Full access, cited, for whoever's permitted it.
- **A scoped answer for another.** Same source, boundaries respected.
- **A refusal.** When a question would cross a boundary your system already enforces elsewhere.

## Why this matters, even though you'll never touch it directly

Before this existed, your access control worked everywhere except the one place users increasingly go first — the AI layer. This record is what closes that gap, without rebuilding the permission system you already trust.

### Specification

The specification here is the connection itself, checkable: does this answer respect the same role boundary your system enforces everywhere else. If it doesn't, that's visible before the answer ships.

### Answer as deliverable

Answers reflect current roles and current data, not a snapshot from whenever the chatbot was last configured. A permission change in your existing system is reflected immediately in what the answering layer will and won't say.

---

*Catenator is one way to change how you work, not the only way. It builds on* Design for the AI Era: Paradigm Shift *([Amazon](https://www.amazon.ca/Design-AI-era-Paradigm-shift/dp/B0H5FWQY7L)) — the book this whole standard grew out of and the standard evolves on.*