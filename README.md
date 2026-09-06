<p align="left">
  <img src="./brand/logo.png" alt="Catenator by Engaged Inquiry" width="100%">
</p>

# Catenator

Catenator turns intent into something real, and makes sure what comes out can be trusted.

This repo holds four things: the standard itself, the documentation that explains it to different readers, working apps built against that standard, and this README tying them together.

## The standard

`docs/schema/` is the actual Catenator standard — the coordinate model, descriptors, views, the -ilities, the YAML format. This is what any Catenator spec, anywhere, is written against.

A schema is the shape something is allowed to take. A specification (spec) is a schema filled in — a specific, structured description of one particular thing. Read `docs/schema/` if you're defining or checking whether something is a valid Catenator spec; everything under `apps/*/specs/` is an instance written against it, not the standard itself.

## The documentation

`docs/` is Catenator explained — refracted for five different readers, because a designer, a tech writer, and an engineer don't need the same explanation of the same idea.

- [Creators](docs/creators/README.md) — designers and writers
- [Tech writers](docs/tech-writers/README.md) — documentation authors
- [Knowledge teams](docs/knowledge-teams/README.md) — building AI-answering systems from scratch
- [Integrators](docs/integrators/README.md) — adding AI answering onto an existing product's roles and permissions
- [Engineers](docs/engineers/README.md) — architects and developers already writing ADRs and specs
- [Governing docs](docs/governing-docs/README.md) — the earlier, fuller technical writeup

Not sure which one is you? Each README opens by telling you plainly whether it's for you or not.

## The apps

`apps/` is where the standard gets tested by building things against it. Each app is a small, spec-driven demonstration — a specific capability, proven by generating a working app from a spec, not by writing code first and describing it afterward.

- `apps/phase-0-single-topic/` — one topic, up to two personas, refraction, delivery. The first proof this approach works. Built, running, verified.
- `apps/shared/` — reusable across every app: `BUILD_INSTRUCTIONS.md` (how to build from any Catenator spec), `RUN_TEMPLATE.md` (the fill-in-the-variables run prompt), and `favicon/` (the app icon every generated app uses).
- `apps/catenator-app/` — the aspirational target the phases are converging toward. Not yet built.

Every app's `specs/` folder (not `schemas/` — see above) holds `system.yaml`, `vocabulary.yaml`, and `components/*.yaml`: the complete, filled-in description of that one app. Generated output is never committed — see `.gitignore` — and never hand-edited. If something's wrong, the fix is in the spec, not the generated code. That's the actual thing being tested.

## Brand

`brand/` holds the Catenator logo (the bracketed asterisk) and favicon source files. These assets are owned by Engaged Inquiry / Parth Upadhye — see `brand/LICENSE.md`. Not covered by the licenses below.

## License

Two licenses cover this repo, depending on what you're looking at.

- The framework, standard, and documentation (`docs/`) — [CC BY 4.0](LICENSE-CC-BY.md).
- The YAML spec format itself — [Apache 2.0](LICENSE-APACHE.md).
- Brand assets (`brand/`) — proprietary, not covered by either license above. See `brand/LICENSE.md`.

---

*Catenator is a developing standard. It builds on* Design for the AI Era: Paradigm Shift *([Amazon](https://www.amazon.ca/Design-AI-era-Paradigm-shift/dp/B0H5FWQY7L)) — the book this whole standard grew out of and the standard evolves on.*