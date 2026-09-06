# Catenator

Not every technical writer needs this. If your job is describing what already shipped, in the order it happened, so support has something to point to — that's real work, but it's not what this is for.

This is for the ones who already know a user guide could be more than a list of steps. You've thought about it — a guide that actually knows who's reading it, that doesn't say the same thing to someone on day one and someone who's used this for two years, that updates itself when the product does instead of quietly going stale until someone notices in a support ticket.

You've probably pitched some version of this before. You were probably told there wasn't time, or it wasn't worth the effort, or nobody asked for it.

Nobody asked for it because nobody had ever seen it. Or there wasn't a way to do this.That's different from it not mattering.

## The guide was never supposed to be static

A user guide gets written once, against whatever the product looked like the week it shipped. Then the product changes — a workflow gets simplified, a button moves, a feature gets deprecated — and the guide doesn't. 

It sits there, technically still published, quietly wrong, until someone hits the gap and files a ticket. 

That's not a documentation problem you failed to solve. It's a structural one: nothing held the guide accountable to the product it was describing, so drift wasn't a risk, it was the default.

The same failure happens sideways, not just forward in time. A first-time user hitting an error and an admin who's seen it a hundred times get the same paragraph, written for neither of them specifically — verbose enough to patronize the expert, still not quite enough context for the beginner. 

You've always known these are two different readers. You've just never had a way to write for both without maintaining two entirely separate guides by hand, and nobody was ever going to give you the time for that.

The industry has been digital for decades but the process still works within the print-paradigm.

## What actually changes

Say what you already know about a use-case — not in a new format, just plainly: who's hitting this, what they already understand coming in, what they need to do, what happens if it goes wrong.

*"A first-time user seeing this error has no idea what a webhook is. An admin seeing the same error already knows, and just needs the retry command."*

That's a persona, stated the way you already think about your readers. From here, it becomes two different guides — not two documents you write and maintain separately, but two shaped versions of the same underlying understanding. The first-timer gets the explanation. The admin gets the command. Neither is a compromise between the two.

## The AI-generated guide is not the answer either

There's a version of "solving" this that isn't actually solving it: point a model at the codebase, ask it to generate documentation, and call the staleness problem fixed because generation is now fast. 

It isn't fixed. It's the same guide, regenerated instead of rewritten by hand — still describing what already shipped, still written after the fact, still with no persona in it at all, just a model's best guess at "the user," singular, undifferentiated. 

Speed isn't the thing that was missing. A governed understanding of who's actually reading was.


---

*Catenator is one way to change how you work, not the only way. It builds on* Design for the AI Era: Paradigm Shift *([Amazon](https://www.amazon.ca/Design-AI-era-Paradigm-shift/dp/B0H5FWQY7L)) — the book this whole standard grew out of and the standard evolves on.*