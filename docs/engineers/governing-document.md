# Governing document

You already write this. An ADR, an API contract, an architecture doc — you're already stating intent before code exists. What's missing isn't the habit. It's a shared structure that makes one document checkable against another.

## Start with what you already know

State the system, the decision, or the boundary you're already documenting — as a claim, not a description.

*"The reminder scheduler polls every 60 seconds and fires each due reminder exactly once."*

That's a rule, stated precisely enough to be true or false. Not "handles reminder timing" — that's a description, and descriptions can't be checked against anything. A claim can.

## The "as-needed" spec is the same failure as the fake persona

Most teams have a version of this already: a design doc written once, at kickoff, never touched again while the actual implementation diverges from it. It gets referenced in the first sprint and ignored in every one after. That's not a documentation failure — it's a structural one. A document that isn't checked against isn't governing anything; it's decoration with better formatting than a persona slide.

> A spec governs or it decorates. There is no middle position.

Governing means the claim is checkable, always, against the current system — not "true when we wrote it."

## Say what actually needs governing

For each part of the system you're specifying:

- Is this a rule (a constraint that must hold), a fact (a description of structure), or a risk (something that can fail, and who bears it)?
- What does this depend on — another part of your system, or an external standard you'd rather reference than redescribe?
- Is this claim currently checkable, or does checking it require someone's memory of a decision that was never written down?

You're not filling in a template. You're deciding which of your existing artifacts are actually claims, and making them checkable.

## Let it hold what you said

Once stated this way, the claim survives the person who wrote it moving to another team, the six-month gap before anyone revisits it, and the agent reading it for the first time with no context beyond what's written.

## Watch it become checkable across formats

The same claim can be referenced from an OpenAPI contract, an ADR, a runtime validation check, or an agent's build instructions — without restating it differently in each place and risking disagreement between them.

## What this connects to

The full coordinate model — descriptors, views, -ilities — is documented in full in this folder. Nothing above requires you to use all of it. It requires that whatever you do use is checkable, not decorative.


---

*Catenator is a developing standard. What's written here reflects where the thinking stands today — expect it to change, sometimes without reconciling neatly with what came before. Contradictions between documents, or between a document and an earlier version of itself, are evidence of the standard evolving, not errors to apologize for.*