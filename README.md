<p align="left">
  <img src="./logo.png" alt="Catenator by Engaged Inquiry" width="100%">
</p>


**The open standard for the specs you feed AI to get a system.**

Catenator is a specification standard for schema-driven development of systems. The spec is the structured description of a system — what it consists of, what it requires, and how its parts relate — expressed in a format that any agent, tool, or team can read and build from.

The spec precedes the system. The system is produced from the spec. Given the same spec, the same system can be produced again.

---

## The problem

Every system has an intention-implementation gap: the persistent distance between what the system was meant to be and what was actually built. Git is version control. A PRD is interpreted prose. Neither closes the gap structurally.

Catenator closes it. The spec is the ground truth — not documentation of decisions already made, but the precondition for making them.

---

## The standard

A Catenator spec describes one thing: a **system**. A system is whatever is being designed and built — a pharmacy, a SaaS platform, a publishing house, a grain elevator.

Every system is specified through **thirteen descriptors**:

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

## The vocabulary

Every domain has its own terms. Catenator's normative vocabulary formally defines terms used in specs — giving shared meaning to words like `proof`, `manuscript`, `edition`, and `rights` so that any agent or team reading the spec understands them the same way.

The vocabulary is organized into clusters. Each term is defined with its descriptor, type, attributes, relationships, and constraints.

Vocabulary is free to use commercially. The canonical document is published by Engaged Inquiry.

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

## The four layers

| Layer | What it is |
|---|---|
| **Standard** | System + thirteen descriptors |
| **Format** | YAML, machine-readable, version-controlled |
| **Methodology** | Spec-driven development as practice |
| **Intelligence layer** | Validation, readiness scoring, generation — coming |

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

