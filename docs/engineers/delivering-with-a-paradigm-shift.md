# Delivering with a paradigm shift

## Delivery here means an agent building correctly, the first time

For engineering specs, "delivery" isn't a document reaching a reader — it's a build reaching correctness without a human in the loop to catch what the spec left ambiguous. Refraction has to have already resolved which precision level the agent needs before the agent starts building, or the build inherits whatever ambiguity the spec didn't resolve.

## The old model: the agent infers, and you find out in review

Before this, an underspecified claim got resolved by an agent's best guess, discovered only when a human reviewer caught the deviation — after the build, not before it. That's the same failure the rest of Catenator argues against everywhere else: a gap papered over by confidence rather than caught by a check.

## What this gives you

**Deviations are visible before the build, not after.** An ambiguous claim is flagged as ambiguous, not silently resolved by inference.

**One spec, correctly consumed by different builders.** A human engineer and an agent both build from the same governing claim, at the precision level each actually needs.

**Drift between spec and implementation becomes checkable, not assumed.** The same claim that specified the build can validate it, continuously, rather than only at review time.

## What it costs

Writing claims precise enough for an agent to build from without inference costs more up front than writing a description a human would correctly interpret from context. This is the same tradeoff as everywhere else in Catenator — inference is cheaper until it's wrong, and wrong is expensive exactly where nobody was checking.



---

*Catenator is a developing standard. What's written here reflects where the thinking stands today — expect it to change, sometimes without reconciling neatly with what came before. Contradictions between documents, or between a document and an earlier version of itself, are evidence of the standard evolving, not errors to apologize for.*