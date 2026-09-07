<p align="left">
  <img src="./brand/logo.png" alt="Catenator by Engaged Inquiry" width="100%">
</p>


**The open standard for writing a spec.**

Software is becoming something you specify, not something you write. The code is still produced — but by agents, tools, and teams working from structured descriptions of what the system must be.

A spec is a structured description of a system — written for an agent. It is not instructions. It is not a prompt. It tells an agent enough about what the system is so that the agent can determine what to do next itself.

Catenator is the open standard for writing one.

**A Catenator spec is what you give an agent instead of instructions.**

---

## What Catenator is

A Catenator spec describes what a system consists of, what it requires, and how its parts relate — in a format that any agent, tool, or team can read and build from.

The spec precedes the system. Given the same spec, the same system can be produced again. From any valid spec, build instructions can be generated. Every part of the system produced is traceable back to the spec decision that required it.

Specs compose. Any spec can connect with any other. Any vocabulary term can be referenced across domains. Systems can be assembled from existing parts without reinventing what already exists.

---

## The coordinate model

A Catenator spec is a coordinate space. Every entry is a coordinate — a located description of one aspect of the system, examined through one lens, at one quality level. The coordinate space has three axes: **descriptors**, **views**, and **-ilities**.

---

## Descriptors

Catenator defines thirteen descriptors — structured lenses for examining a system. No descriptor is mandatory. Use what the system requires. The descriptors are not a checklist. They are a vocabulary.

| Descriptor | Specifies |
|---|---|
| `domain` | the vocabulary and rules governing it |
| `model` | the data structures it operates on |
| `component` | the discrete, reusable pieces it is made of |
| `service` | the capabilities it exposes or consumes |
| `operation` | the individual operations it performs |
| `actor` | who or what interacts with it |
| `event` | what it must respond to |
| `rule` | internal or external constraints it must enforce |
| `process` | the workflows it executes |
| `integration` | its boundaries with external systems |
| `utility` | what it does for whom and to what end |
| `risk` | what can go wrong, how likely, and who bears it |

---

## The format

Specs are written in YAML. Machine-readable, version-controlled, composable.

```yaml
system: publishing-platform
version: 0.1.0
domain: editorial

actors:
  - id: author
    type: human
    description: Submits manuscripts for review and publication

rules:
  - id: proof-approval
    type: internal
    constraint: A proof status cannot revert from approved to pending
```

---

## The -ilities

A valid Catenator spec is:

- **Reproducible** — the same spec produces the same system
- **Compilable** — build instructions are derivable without human interpretation
- **Traceable** — every system decision traces back to a descriptor
- **Composable** — specs reference and build on other specs
- **Extensible** — new domains and vocabularies can be added without breaking existing specs
- **Portable** — any conforming agent or tool can read and act on the spec

---

## Licensing

| Layer | License |
|---|---|
| Framework | CC BY 4.0 |
| YAML schema | Apache 2.0 |
| Normative vocabulary | CC BY 4.0 — EI copyright on canonical document |
| Intelligence layer | Proprietary |

---

## Status

The standard is in active development. The vocabulary, schema, and v1.0 framework are being published here as they are completed.

**© 2026 Parth Upadhye / Engaged Inquiry**
