# Upgrade an existing rep to the standard (run in Claude Code at the repo root)

For a rep that graded poorly, or a project from outside this repo you want to bring in. Paste the block with the path set.

---

Bring the project at `<path>` up to the standard of `reps/01-clients-refresh/` and `reps/02-itinerary-editor/` in this repo, without changing which three bug classes it covers. If it isn't in `reps/`, move it there as `reps/NN-slug/` in the repo layout described in `generator/GENERATE-REP.md`, importing from `../../../shared/format` and using `shared/styles.css` class names.

1. Verify, don't assume. For each ticket, trace the steps through the code value by value and confirm the symptom happens on screen. If a bug does not reproduce (a cast that does nothing, a payload the UI never shows, a "probably" in the key), redesign it so a user sees it within three steps, every time.
2. Make each bug compound: a realistic second ingredient so an obvious patch hides the symptom but leaves the cause. Prefer symptoms where two parts of the UI disagree.
3. Hunt for accidental bugs and remove them. Exactly three bugs.
4. Remove contrived architecture (effect chains, auto-confirming carts, useEffect state machines). Ordinary code around each bug.
5. Rewrite the tickets in a PM's voice with one breadcrumb and no code vocabulary.
6. Rewrite KEY.md in the full format (Where, Layer, Why it breaks with values, Fix, Looks right but isn't, Fastest way to find it, The tell, Say it like this, Production angle, Not bugs, Generator QA).
7. Advisor-portal domain, realistic data.
8. Split the mock into `api/server.ts` (fixtures plus `apiFetch`, readable, not changeable) and `api/client.ts` (typed functions the components call). Boundary fixes go in `client.ts`. The key must never call a change invalid and then propose an equivalent change in the same function.
9. No one-token typos: the data behind every bug passes through a transform and the symptom suggests a different cause than the real one.
10. Write `.verify/bugs.test.tsx`, `.verify/check.test.tsx`, and `.verify/solution/`, then make `npm run typecheck`, `TZ=America/New_York npm run verify NN`, and `TZ=America/New_York npm run solution NN` all pass. Never weaken a test to pass it.
Do not print the key or describe the bugs in chat. Finish with one line: what changed, as counts (bugs redesigned, tickets rewritten, accidental bugs removed).
