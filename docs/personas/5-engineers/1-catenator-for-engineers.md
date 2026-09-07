# Catenator for engineers

Not every system needs this. If your specs are small, stable, and read by exactly one team that already agrees on conventions, a good README and a consistent style are enough. This isn't solving a problem you have.

This is for the ones who've already built more governance than they get credit for — an ADR here, an API contract there, a schema for one service and a wiki page for another — and know none of it actually connects. Nothing traces a decision in one document to its consequence in another. Nothing stops the API contract and the ADR that justified it from quietly disagreeing six months later. You didn't lack discipline. You lacked one vocabulary that worked the same way across all of it.

And increasingly, your specs have a second reader you didn't design for. An AI agent building from your API contract, your schema, your architecture doc is doing exactly what a junior engineer used to do — inferring what wasn't stated, guessing at what's statistically common rather than what you actually meant. A junior engineer eventually learns your codebase's conventions. An agent starts over every time, from whatever's in its context window.

## What Catenator actually is, for you

Not a replacement for your ADRs, your OpenAPI specs, your existing conventions. A coordinate system underneath all of them — descriptors (what aspect of the system), views (what lens), -ilities (what quality bar) — so a rule in one part of your system and a rule in another are checkable against the same standard, instead of two different ad hoc formats that happen to both be called "documentation."

Existing standards aren't replaced. An OpenAPI contract still describes your API — Catenator wraps it, so a claim about that API is traceable and governed the same way a claim anywhere else in your system is, without you re-describing REST semantics in a new vocabulary.

## What this isn't

This isn't the plain-language version. If you want the schema, the actual YAML, the coordinate model in full — that's exactly what this folder is for, no simplification, no persona-friendly framing standing between you and the mechanism.


---

*Catenator is a developing standard. What's written here reflects where the thinking stands today — expect it to change, sometimes without reconciling neatly with what came before. Contradictions between documents, or between a document and an earlier version of itself, are evidence of the standard evolving, not errors to apologize for.*