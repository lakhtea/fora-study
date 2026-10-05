# Logistics

## Recruiter questions (send any you haven't)

React version, and whether the page uses libraries (router, data fetching, a UI kit). Are AI coding tools allowed in live rounds? React Intensive: build, profiling, or conceptual; CoderPad again; DevTools expected? API Design: whiteboard-style or implementing; what tool; is there a break between the two hours? Which pod and who is the hiring manager? Interviewer names per round. Is the career ladder shareable? Timeline between rounds; who is on the social call; who is on the leadership team.

## Scheduling round 1

Fora schedules 10am to 5pm ET via the Greenhouse link. Five or six days out gives you the reps. Not on the same day as another company's loop and ideally not the day before. Offer three or four windows. If you run in the mornings, 11am to noon.

## Outreach (two 15-minute conversations before round 2; never ask for a referral)

Targets: current frontend engineers named on the careers page (Dan Milisits, Kyle Rose, Paul Banel; verify titles on LinkedIn), engineers who joined in the last 18 months, alumni who left in the past year, anyone in your App Academy or LTV network with a Fora connection. Send within 48 hours. Your voice, normal formalities, say you're in process, ask for 15 minutes with two time windows, give them something to talk about, don't reiterate your resume. Thank-you the same day.

Draft, current engineer:

> Hi [First name], hope you're doing well. My name is Lakhte, I'm a frontend engineer in Brooklyn, and I'm currently interviewing at Fora for the Senior/Staff Frontend Engineer role on the advisor experience. I came across your name on the engineering careers page and wanted to reach out. I'd love 15 minutes to hear what the work is like on your pod and what you've found matters most in the interview process. I'm curious how AI has ended up in the CI/CD pipeline day to day and how the itinerary builder handles autosave and AI drafts. Happy to work around your schedule; would Thursday or Friday afternoon work? Thanks so much, Lakhte

Draft, alum:

> Hi [First name], hope all is well. I'm Lakhte, a frontend engineer in Brooklyn, in the interview process at Fora Travel for a senior frontend role. I saw you were on the engineering team there and wanted to ask if you'd be open to a quick 15-minute chat. I'm mostly hoping to understand how the technical rounds are run and what the team culture is like in practice, and I'd be glad to hear what you're working on now. Any time this week or next works on my end. Thanks for considering it. Best, Lakhte

Ten questions for the call: how the debugging round is run; whether candidates use DevTools live; what makes a good API design answer; what the EM round focused on; how the coffee chat feeds the decision; which pods are hiring frontend; the advisor portal's stack and whether there's a shared component library; what "AI in CI/CD" means in practice; what surprised them after joining; what they wish they'd asked.

## Setup checklist (day before any live round)

Node LTS; a CoderPad sandbox React TypeScript pad opened at least three times with the preview in a new tab and React DevTools working there; VS Code font up two steps; notifications off; no AI assistant unless the recruiter said yes; CodeSandbox and StackBlitz logged in; Zoom updated and macOS screen-recording permission granted (System Settings, Privacy and Security, Screen and System Audio Recording), a full share test with pad plus preview; AI note-takers off (Zoom AI Companion, Otter, Granola, Fathom, Fireflies, Read.ai removed from the calendar); Cursor, Copilot, and AI browser extensions closed; water, notepad, the six-step protocol on a sticky note; ten minutes before, one merge and one sort from the array warm-up, then say your first sentence out loud once.

## Thirty-minute review sheet (the only thing you read before a round)

- Round 1: three bugs, ten minutes each. Read the page for a minute and describe it; open the preview in a tab; name each bug's flavor; silent console plus wrong page means look for `as`, `!`, `any`, `?.`, `res.json()`; verify every fix and say "verified"; park and move on without apology; summary at minute 28.
- Protocol: restate, reproduce, read the console, localize with DevTools, hypothesize and prove, fix the cause, verify and name the test.
- Classes: stale closure, functional updater or ref. Missing cleanup, return a function. Debounce, clear the previous timer. Race, cancelled flag checked after the await. Keys, stable ids. Mutation, new references, `toSorted`. Derived state, compute in render or key the component. Hooks, top level, same order. Types lie at boundaries; parse there.
- DevTools: Ranked view first, then "why did this render," then base versus actual duration. Fix order: state placement, composition, memo, then defer or virtualize.
- API hour: frame, model with state machines, full endpoint table, three payloads and one error shape, two or three hard parts deep (version and 409, idempotency key, cursors, 202 and SSE, flaky supplier: cache, retry with backoff, breaker), how the UI consumes it, the v1 cut.
- React hour: plan in a comment, static first, one interaction at a time verified, data with loading, error, empty, race guard, a Profiler pass, tests you'd write.
- Lead story: four agents, single responsibility each, tests and CI green before a human gate, about an hour saved per issue, speed versus trust chosen on purpose. Second: multi-repo spin-up grown into an MCP dev environment, about 30 minutes saved per workflow. Soften the Vitest numbers. Never invent a metric.
- Why Fora: real users whose livelihoods depend on the product; pods with end-to-end ownership; AI in how they work; public levels; you want to be in the office with peers, mentors, and mentees.
- Narrate. Say the plan before typing. If stuck, narrow out loud. Level is set by performance; play every round to win it.
