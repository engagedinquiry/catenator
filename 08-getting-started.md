---
title: Getting started — the macro, meso, and micro layers
section: "4.0"
version: 0.1
date: 2026-03-05
status: draft
---

# Getting started

## The macro layer

Every system has a whole. Before it has features, workflows, screens, or components — it has a shape. The macro layer is where that shape is named.

Throughout this section SIC — a satirical publishing imprint — is the running example. Not because publishing is your domain. Because every system, in every domain, decomposes the same way.

**What are macro specs?**

A macro spec describes the system at its highest level of resolution. It names what the system is, what it does, who it does it for, and what major parts it consists of. It does not describe how any part works. It does not name screens, fields, or buttons. It holds the whole without collapsing into any piece of it.

The level of detail is exactly enough to hand to an agent and have it understand what is being built — not enough for it to build any specific part.

**Identifying the macro**

You already know what your macro is. You have described it in one sentence dozens of times — to a colleague, in a deck, in a brief. SIC is a satirical publishing imprint that produces card-format definitions of business jargon. One sentence. That is the macro.

The work of this section is not discovery — it is recognition. Find the sentence you already say and make it the first line of the spec.

**Breaking down into blocks**

Every system divides naturally into major functional areas. For SIC: Editorial, Ecommerce, Production, Fulfillment, Admin. These are not features — they are domains. Each one is a coherent area of responsibility with its own objects, actors, and rules.

The blocks are visible once you look for them. You have probably already named them — in a conversation, in a diagram, in a back-of-napkin sketch. This section is where you make them explicit.

**Defining the blocks and sub-blocks**

A defined block has a name, a purpose, and a boundary. It says what belongs to it and what belongs to the block next to it. Editorial owns the manuscript and everything that happens to it before it goes to production. Production owns everything from print-ready to shipped. The boundary is the definition.

Once each block is defined at this level, the macro spec is complete — and each block becomes the starting point for a meso spec.

---

## The meso layer

The macro named the blocks. The meso opens them. Each major functional area — each domain — gets its own spec at this layer. The meso layer is where the system stops being a shape and starts being a set of working parts.

**What are meso specs?**

A meso spec describes one domain of the system. It names the objects that live in that domain, the actors who operate within it, the rules that govern it, and the processes that run through it. It does not describe individual screens or the components on them — those are micros.

The meso layer is where design decisions live. The rules that govern proof approval, the actors who can reject a submission, the states a manuscript can occupy — these belong here.

**Identifying the meso**

A meso is a domain — a coherent area of the system with its own vocabulary, its own rules, and its own actors. If you can describe it without describing any other part of the system, it is a meso.

The test is independence. If removing a domain from the description leaves the others intact, it is a meso.

**Breaking down into blocks**

Each meso domain contains workflows — the sequences through which its objects move. Editorial contains Submission, Review, Proofing, and Sign-off. Each workflow is a block at this layer. The blocks are the paths objects travel through the domain.

**Defining the blocks and sub-blocks**

A defined workflow block names its sequence, its actors, its states, and its transitions. It does not describe the submission form, the notification email, or the database record — those are micros. The meso definition is complete when an agent can understand what happens in the workflow without being told how to implement any step.

---

## The micro layer

The meso named the workflows. The micro opens each step. At this layer the system resolves into its smallest meaningful units — individual operations, each one complete in itself.

**What are micro specs?**

A micro spec describes one step — one operation or component at the point where behavior is specific enough to implement. Behavior at this layer is largely generic: something comes in, something happens, something goes out. The micro doesn't need to know about the system around it. It only needs to know its contract — what it receives, what it does, what it returns.

The level of detail is exactly enough to build this step without ambiguity, and no more.

**Identifying the micro**

A micro is the smallest step that does one thing. If a step does two things, it is two micros. If a step cannot be described without describing the step before or after it, it is not yet a micro — it is still a workflow fragment.

The test is atomicity. Assign manuscript to editor is a micro. Assign manuscript to editor and notify writer is two micros. The boundary is the action — one action, one micro.

**Defining the blocks and sub-blocks**

A defined micro names its input, its action, and its output. It declares its actor — who or what initiates it. It declares its constraints — what conditions must be true before it runs, what conditions must be true after it completes.

Example: Receive submission — input is a manuscript reference and a writer reference, action is to create a submission record and transition the manuscript to editor queue, output is a submission confirmation. An agent can build it from that definition alone.
