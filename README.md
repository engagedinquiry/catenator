# Catenator standard

The open standard for machine-readable product specifications.

Software is becoming something you specify, not something you write. The code is still produced — but by agents, tools, and teams working from structured descriptions of what the system must be. Across the industry, a spec is emerging as the primary artifact of software development — structured, semantic, and machine-readable.

**Catenator is the open standard for writing one.**

---

## What is a Catenator spec?

A Catenator spec is the structured description of a system — what it consists of, what it requires, and how its parts relate — expressed in a format that any agent, tool, or team can read and build from.

Given the same spec, the same system can be produced again. From any valid spec, build instructions can be generated. The system produced can be tested against the spec that produced it.

## Repository contents

- `docs/` — framework documentation (explanatory)
- `SPEC.md` — the normative standard
- `schema/` — YAML schema and JSON Schema validation
- `examples/` — minimal and complete spec examples

## Vocabulary

Domain vocabulary is maintained separately in [catenator-vocab](https://github.com/engagedinquiry/catenator-vocab).

## License

- Framework and documentation: CC BY 4.0
- YAML schema and validation layer: Apache 2.0

© 2026 Parth Upadhye / Engaged Inquiry
