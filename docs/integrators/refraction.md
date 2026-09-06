# Refraction

Don't let it just sit there. Make it work.

## What your system always knew

Your product already knows an admin and a guest aren't the same. It's enforced that distinction in every other part of the system for years. The AI layer is the one place that forgot — not because the distinction is hard, but because nobody connected it.

## Every role gets its variant

The same underlying knowledge base can answer differently per role, using the permission logic your system already has — not a new access-control system built specifically for the chatbot.

> The missing piece was never a new persona model. It was connecting the one you already had.

## What actually changes, per role

| Dimension | What it means for you |
|---|---|
| **Trust** | What this role's answer needs to be grounded in, and what permission level it must respect before answering at all. |
| **Context** | What this role already has access to, according to your existing system — not a new assumption, the one already enforced elsewhere. |
| **Content** | What's actually included in the answer, scoped to what this role is permitted to see. |
| **Time** | Whether the answer reflects current permissions and current data, not a cached response from before a role's access changed. |
| **Surface** | How the answer is displayed — rarely where the actual risk in these systems lives. |

## The one non-negotiable: the answering layer inherits the same boundary your system already enforces

This isn't optional per role the way tone or depth might be. If your access-control layer would block a request, the answering layer has to respect that same boundary — not because refraction adds a new rule, but because it's finally checking the rule that was always there.

## Refining is normal — expected, even

If a role's answers still feel wrong, that's the governing document needing another pass — usually because a permission boundary wasn't stated precisely enough for the answering layer to check it.

## The test for whether it's working

If an answer includes something that role shouldn't see according to your own system, that's not refraction misbehaving — it's a sign the governing document didn't state the boundary your access control already enforces elsewhere.

---

*Catenator is one way to change how you work, not the only way. It builds on* Design for the AI Era: Paradigm Shift *([Amazon](https://www.amazon.ca/Design-AI-era-Paradigm-shift/dp/B0H5FWQY7L)) — the book this whole standard grew out of and the standard evolves on.*