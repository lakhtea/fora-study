# Tracker

Tick a box only when the task is done to the standard written next to it. Commit after each session. When every box is ticked, you have covered everything this loop can ask.

## 0. Today (do first)

- [ ] Recruiter questions sent (`interviews/logistics.md`): React version and libraries; AI tools allowed; React Intensive format; API Design format and tool; pod and hiring manager; interviewer names; career ladder; who is on the social call and the leadership team.
- [ ] Round 1 slot picked on the Greenhouse link: five or six days out, three or four windows, not adjacent to another loop.
- [ ] Two outreach messages sent (one current engineer, one alum), using the drafts in `interviews/logistics.md`.
- [ ] `npm install` and `npm run typecheck` pass. CoderPad sandbox visited: React TypeScript pad, preview in a new tab, React DevTools working there, key bindings set.
- [ ] `interviews/fora-facts.md` read once. foratravel.com/careers/engineering read once.

## 1. Round 1: React debugging (45 minutes, CoderPad, 3 bugs)

Protocol and budget: `interviews/round-1-debugging.md`. Each rep: 30-minute timer, narrate, `npm run check N`, then `KEY.md`, then log misses.

- [ ] Rep 01 Clients refresh: stale interval closure, string id across the API boundary, spread key collision
- [ ] Rep 02 Itinerary editor: out-of-order responses, non-null on a stale selection, index keys with an uncontrolled input
- [ ] Rep 03 Booking form: in-place mutation with a stale memo, 422 collapsed to $0.00, sort mutating shared data
- [ ] Rep 04 Hotel search: effect deps, [object Object] from a lying type, concatenating reduce
- [ ] Rep 05 Commissions: listener without cleanup, cast letting "Paid" through, midnight boundary vs timestamps
- [ ] Rep 06 Client settings: props copied into state once, index signature lie, save stuck on rejection
- [ ] Rep 07 Trips timeline: delay instead of debounce, two optional names for one prop, date-only string parsed as UTC
- [ ] Rep 08 Payout dashboard: controlled-then-uncontrolled input, string id through a union type, memo missing a dependency
- [ ] Rep 09 Supplier onboarding: memo defeated by inline props, non-null on a required-but-missing doc, memo ignoring an input
- [ ] Rep 10 Client share view: setState during render, a 410 collapsed into an empty trip, day-switch race
- [ ] Rep 11 Supplier deals: state read right after setting it, [object Object] from a lying type, sort mutating the featured strip
- [ ] Rep 12 Notifications: effect depending on the state it sets, option values vs the union, concatenating reduce
- [ ] Rep 13 Travelers: a hook inside a condition, an index signature promising every expiry, calendar-month counting at a boundary
- [ ] Rep 14 Group rooms: a form that keeps state across a change of subject, two numbers in the wrong order, no path for a rejected request
- [ ] Rep 15 Price Drop: a form submit with its default, a reference typed as a number, a date-only string parsed as UTC
- [ ] Rep 16 Commission rules: keystroke state too high, a nullish default inventing a rate, a memo on half its inputs
- [ ] Rep 17 Import clients: defaults spread over the data, a wrapper key that isn't there, rows keyed by a repeating field
- [ ] Rep 18 Messages: async subscription with no cleanup, Title Case union vs lowercase wire, thread-switch race
- [ ] Rep 19 Availability calendar (generate: `generator/GENERATE-REP.md`, REP=19; grade with the two-minute checklist below; run). Every class in the taxonomy has now been seen once.
- [ ] Rep 20 Team leaderboard (generate, grade, run)
- [ ] Rep 21 Refund requests (generate, grade, run)
- [ ] Rep 22 Trip costs (generate, grade, run)
- [ ] Rep 23 Supplier contacts (generate, grade, run)
- [ ] Rep 24 Hackathon votes (generate, grade, run)
- [ ] Rep 25 Final mock: generated, then run as the full 45 minutes with Claude as the interviewer (intros, three bugs, Q&A), graded on Fora's four criteria (completeness and verification, communication, technical knowledge, debugging skills)
- [ ] At least three reps run inside the CoderPad sandbox (files pasted into a React TypeScript pad) with the share layout rehearsed
- [ ] Six-step protocol said aloud from memory, cold, three days in a row
- [ ] Array warm-up `coding/01-arrays-warmup` passing, with memory narrated for each function
- [ ] The ten Q&A questions in `interviews/round-1-debugging.md` read; three chosen and said aloud
- [ ] Classes to re-drill (fill in as you go): ____________________. Each one re-drilled in a later rep or a generated variant.

Two-minute grade for a generated rep (any "no" means run `generator/UPGRADE-REP.md` or regenerate): tickets have a named non-developer reporter, concrete values, no code words; each ticket describes something on screen with one breadcrumb; advisor-portal page; `api/server.ts` and `api/client.ts` present; `npm run verify N` passes; 60 seconds of clicking through the README behaviors finds nothing broken outside the tickets.

## 2a. Round 2, hour 1: API Design (60 minutes)

Script, conventions, probes, rubric: `api-design/`. Each rep: 60-minute timer, Claude as interviewer with the probes after minute 35, graded with the rubric.

- [ ] Prompt 1 Itinerary builder (then compare with the model answer)
- [ ] Prompt 2 Supplier search (then compare with the model answer)
- [ ] Prompt 3 Price Drop alerts
- [ ] Prompt 4 Advisor onboarding
- [ ] Prompt 5 Payouts and reconciliation
- [ ] Prompt 6 Traveler co-creation
- [ ] Prompt 7 Group trips with cost splits
- [ ] Prompt 8 Via assistant actions
- [ ] One cold prompt generated by Claude in a fresh chat, run and graded
- [ ] Conventions cheat sheet recited from memory: status codes, cursor vs offset, PATCH with version, idempotency key, 202 and SSE, one error shape, additive versioning
- [ ] Every probe in `api-design/PROBES.md` answered aloud in under 90 seconds, recorded
- [ ] Rubric score 18 or more on the last two reps

## 2b. Round 2, hour 2: React Intensive (60 minutes)

Budget, DevTools tour, playbook, concepts, drills: `interviews/round-2-react-intensive.md`. Each app: 60-minute timer, narrate, `npm run accept N`.

- [ ] App 01 Clients directory built, acceptance passing (async lists, debounce, race guard)
- [ ] App 02 Itinerary builder built, acceptance passing (reducer, undo, autosave, 409)
- [ ] App 03 Booking wizard built, acceptance passing (forms, validation, server field errors)
- [ ] App 04 Rates grid built, acceptance passing (memo, deferred value, windowing by hand)
- [ ] App 05 Report jobs built, acceptance passing (202 and polling, retry with backoff, cancel, error boundary)
- [ ] Profiling drill A on app 04: record while typing, read flamegraph and ranked view aloud, name the problem before touching code
- [ ] Profiling drill B: fix three ways (state colocation, memo plus useCallback, useDeferredValue), compare actual durations, say which you'd ship
- [ ] Profiling drill C: add a context holding theme plus filter, show the over-render, split it
- [ ] Profiling drill D: "why did this render" on a memoized row with an inline style object
- [ ] Fourteen concept explanations recorded, each under a minute, each ending cleanly (list in `interviews/round-2-react-intensive.md`)
- [ ] The eight "questions this hour tends to ask" answered aloud
- [ ] One full two-hour block run back to back, three or four days before round 2: API prompt, ten-minute break, then one app, with Claude as interviewer

## 2c. Coding (Fora screens and the Thumbtack problems you should have drilled)

- [ ] `coding/01-arrays-warmup` passing
- [ ] `coding/02-review-search` stage 1 passing
- [ ] `coding/02-review-search` stage 2 passing (AND search)
- [ ] `coding/02-review-search` stage 3 passing (phrase search with positions)
- [ ] `coding/03-ranked-window` stage 1 passing (the Thumbtack round-1 problem: Map of rankers, cursors, no duplicates)
- [ ] `coding/03-ranked-window` stage 2 passing (feed with cursors across pages)
- [ ] `coding/04-debounce-and-latest` passing, with the two mechanism sentences said precisely (the guard blocks the write when the await resumes; the request still completes)
- [ ] `coding/05-commissions-aggregate` passing (Map aggregation, comparator chain with localeCompare)
- [ ] Map API cold: `for...of` over entries, `.get`, `.set`, `.has`, `.keys()`, `.values()`, insertion order

## 3. Round 3: EM (60) and social call (30)

Stories, questions, social call: `interviews/round-3-em-and-social.md`.

- [ ] Story 1 four-agent on-call tool recorded at 90 seconds with two Claude follow-ups answered
- [ ] Story 2 AI dev environment recorded, follow-ups answered
- [ ] Story 3 shared platform for nine teams recorded, follow-ups answered
- [ ] Story 4 Cypress to Vitest recorded with the softened numbers, follow-ups answered
- [ ] Story 5 Ember to React migration recorded, follow-ups answered
- [ ] Story 6 direct report recorded with one concrete outcome, follow-ups answered
- [ ] Story 7 A/B testing infrastructure recorded, follow-ups answered
- [ ] Story 8 BofA blotters recorded, follow-ups answered
- [ ] The ten likely EM questions answered aloud, including the degree, the gap since August, and the Senior vs Staff question
- [ ] Every row in "How they say they work" (`interviews/fora-facts.md`) has a story attached
- [ ] Seven questions for the EM chosen and said aloud
- [ ] Social call: the two-minute intro recorded three times until it ends cleanly
- [ ] Social call: the PM and designer collaboration answer and the disagreement answer said aloud
- [ ] Social call: five questions for them written; recruiter asked who it's with

## 4. Round 4: leadership team (90 minutes onsite) and coffee

- [ ] Why Fora in three parts written and recorded
- [ ] Why travel, why now, with one true sentence
- [ ] First 90 days answer recorded
- [ ] In-office answer recorded
- [ ] Scope (Senior vs Staff) answer recorded, ending with the ladder question
- [ ] Five questions for leadership chosen
- [ ] Pod map read; one question per pod written on an index card
- [ ] Preference sentence rehearsed ("Advisor Enablement is where I'd add the most, and the Web pod's Next.js work is close to what I did")
- [ ] Recon: consumer site browsed (Explore, Get matched, Hot List, The Journal); a Fora product video or tech roundup watched; TechCrunch and Forbes Series D pieces read; Applied AI and Finance postings skimmed
- [ ] Recruiter asked for the leadership team's names and the engineers at coffee; their public posts read
- [ ] Commute planned; arrive fifteen minutes early

## 5. Before each live round

- [ ] Setup checklist in `interviews/logistics.md` completed (Zoom permission, share test, AI note-takers off, Cursor and Copilot closed)
- [ ] Thirty-minute review sheet read, and nothing else
- [ ] One merge and one sort from the array warm-up ten minutes before round 1

## 6. After each round

- [ ] Round 1 debrief written: what was asked, what went well, what to change; sent to the recruiter a short thank-you
- [ ] Round 2 debrief written
- [ ] Round 3 debrief written
- [ ] Round 4 debrief written

## Classes to re-drill

Add a line per miss: date, rep, class, what fooled you. Re-drill by generating a variant: "GENERATE-REP.md with REP=<next> but replace slot A with class <X> in a new setting."
