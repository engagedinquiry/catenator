# Delivering with a paradigm shift

## Delivery requires a deliverable

Delivery is the act of getting a deliverable to someone. It depends on refraction having already happened — there's nothing to deliver until intent has been shaped, for a persona, into something specific. A server can't deliver what hasn't been refracted any more than a courier can deliver a package that hasn't been packed.

## Governance happens locally, not on a server

**Vrit** is Catenator's delivery mechanism for reader-controlled reading experiences — the concrete case where context stays local and refraction happens on the consumer's own device rather than on a server. It's the working proof that "governance happens locally, not on a server" isn't just an architectural claim; it's something built and running.

Vrit's persona is whoever or whatever consumes the deliverable — a human reader, or an agent. This isn't a demographic or a role description — it's the authored decision that shapes everything Vrit delivers. Wherever "reader" appears below, it stands in for consumer in the Refraction sense: an intent-bearing decision about how to shape the deliverable, not an assumption about who or what is on the other end of it.

Vrit is the clearest example of what a governed, refracted deliverable actually looks like once it's built. The consumer's context — what they've read or processed, where they are in it, what they need next — stays with the consumer. It's never transmitted to a server and used to decide what version of the deliverable they're allowed to see. The device governs the experience, using context that never leaves it.

This is the same **Context** dimension named in Refraction — what the system knows about the actor before they act — except here it's answered precisely: what the system knows stays with the consumer's own device, not with a server holding a profile on their behalf.

## Why paradigm shift, not a feature?

The old model: a server holds a profile and decides what to send, based on data it controls, not the consumer. That isn't refraction — it's a guess made on someone's behalf, by something that isn't them.

This matters at least as much for an agent-consumer as a human one — an agent's task state and prior context are exactly the kind of thing that shouldn't need to be handed to a server just to receive a shaped deliverable.

Refraction already argues against this directly: real refraction happens per persona, shaped for whoever's receiving it, not inferred from a profile someone else owns.

Vrit inverts the old model. The deliverable arrives as raw material, ungoverned by any server's assumptions about who or what the consumer is, and is shaped into the consumer's specific experience locally — by their own device, governed by the same rules Creation already established, not by a server deciding on their behalf.

Refraction being computationally possible doesn't mean it's possible *locally*. A server generating a shaped deliverable per persona is one capability; a consumer's own device doing the same shaping, without sending anything to a server first, is a narrower and more recent one — it requires models small and capable enough to run where the consumer already is, not just a capable model existing somewhere reachable over a network.

Before on-device inference reached that threshold, "governance happens locally" would have been the correct architecture with no way to build it.

Vrit is what becomes possible only once local shaping is no longer a compromise.

## What delivery gives you, once it happens locally

**No profile required.** The device shapes the deliverable using context it already has. Nothing about the consumer has to be sent anywhere, stored anywhere, or inferred by anything other than their own device.

**Freshness without re-transmission.** Because refraction can happen at the moment of delivery, the deliverable reflects the governed source as it stands right now — not a snapshot a server cached and served to save a round trip.

**One governed source, many deliverables.** The same governed content can be delivered differently to as many personas as encounter it — human or agent — without a separate authored copy per persona and without a server needing to know which persona it's talking to in advance.

## What it costs

Shaping a deliverable locally, at the moment of delivery, means paying that computation on the consumer's own device, each time, rather than once, centrally, ahead of time. This is the same timing tradeoff named in Refraction — ahead of time buys speed at the moment of delivery; on the fly buys freshness and local governance at the cost of doing the work again, on-device, every time.

---

*Catenator is a developing standard. What's written here reflects where the thinking stands today — expect it to change, sometimes without reconciling neatly with what came before. Contradictions between documents, or between a document and an earlier version of itself, are evidence of the standard evolving, not errors to apologize for.*
