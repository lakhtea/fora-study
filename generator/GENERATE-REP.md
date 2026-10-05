# Generate a rep into this repo (run in Claude Code at the repo root)

Paste everything below the line into Claude Code with REP set. It writes the rep into `reps/NN-slug/` in this repo's layout and must pass `npm run typecheck`, `npm run verify NN`, and `npm run solution NN` before it hands over.

---

You are generating practice project number REP = <set me, 07 to 25> for a timed React debugging interview, into an existing repository. Read `generator/REP-CARDS.md` for the card that matches REP: it fixes the page, the three bug classes, and the compound ingredient for each. Read `reps/01-clients-refresh/` and `reps/02-itinerary-editor/` end to end first: they are the standard for code shape, ticket voice, key format, tests, and the solution overlay. Match them.

REPO LAYOUT (exactly this, inside `reps/<REP>-<slug>/`, slug from the card)
- `App.tsx` default export, the page shell
- `types.ts`
- `api/server.ts`: the simulated backend. Fixtures (12 to 30 records) and `export async function apiFetch(url: string, init?: RequestInit): Promise<Response>` routing paths and query strings to JSON responses after latency, using `json` and `wait` from `../../../shared/format`. README says it stands in for the real service: readable, not changeable. Latency deterministic enough to reproduce async bugs (scale with payload size, or a fixed longer delay on one route).
- `api/client.ts`: the frontend API layer, typed functions the components call, each calling `apiFetch`, checking `res.ok`, returning the parsed body. Boundary fixes live here, never in `server.ts`.
- `components/*.tsx`: three to five components. Import `formatDate`, `money`, `moneyCents` from `../../../shared/format`; use the class names in `shared/styles.css` (page, page-header, muted, toolbar, layout, table, panel, card, item, list, badge, form, row, notice, danger, counter). Every interactive element has an `aria-label` or a real label.
- `README.md`: acceptance behaviors, layout, how to run (`npm run rep NN`, `npm run check NN`), then the three tickets.
- `BUGS.md`: the three tickets alone.
- `KEY.md`: the answer key.
- `.verify/bugs.test.tsx`: Testing Library tests that (a) render the page and assert a clean load, (b) exercise every README behavior that is not a ticket and assert it works, (c) for each ticket perform its steps and assert the buggy outcome. Describe blocks named "rep NN: page works outside the planted bugs" and "rep NN: the three planted bugs reproduce".
- `.verify/check.test.tsx`: tests that assert each ticket is resolved plus one "the rest of the page still works" test. These are the acceptance tests the candidate runs with `npm run check NN`.
- `.verify/solution/`: copies of only the files that change when the key's fixes are applied, at the same relative paths (`App.tsx`, `components/X.tsx`, `api/client.ts`, `types.ts`). `npm run solution NN` overlays them on a scratch copy and runs `check.test.tsx`.
- Total app code (ts and tsx under the rep, excluding `.verify`): 300 to 550 lines. Tests use `vi`, `describe`, `it`, `expect` as globals (vitest globals are on) and `@testing-library/jest-dom` matchers (set up globally). Use `TZ=America/New_York` when running.

BUG CLASSES
A. React mechanics: R1 state mutated in place; R2 state read right after setState; R3 derived value copied into state once; R4 setState during render after a user action; R5 handler invoked at render; R6 `count && <X/>` renders 0; R7 hook called conditionally; E1 stale closure in a timer or subscription; E2 wrong or missing effect deps; E3 effect sets the state it depends on; E4 missing cleanup; E5 delay instead of debounce; E7 async function passed to useEffect; L1 index keys with row-local or uncontrolled state; L2 duplicate keys from data; L3 child keeps stale local state when the selected item changes; M1 memo defeated by an inline prop; M2 context value recreated every render; M3 state too high in the tree; F1 controlled input initialized undefined; F2 submit without preventDefault; F3 event read after an await; F4 wrong event property or element type.
B. TypeScript lies (compile under strict; the type is wrong, the runtime shows it): T1 cast or non-null assertion hiding null; T2 any letting a wrong response shape through; T3 string vs number ids across a JSON or URL or DOM boundary; T4 union or literal mismatch never narrowed; T5 index signature or generic promising a value that may be missing; T6 optional chaining or nullish default silencing a real failure; T7 prop contract mismatch hidden by loose typing.
C. Logic, data, async: D1 sort or reverse mutating the source; D2 off-by-one or boundary (granularity mismatch, inclusive vs exclusive); D3 two objects merged with a shared key; D4 date-only strings parsed as UTC midnight, or dates compared as strings; D5 numeric or money math (decimal strings in a reduce, cents vs dollars, float accumulation); D6 stale derived value (memo with a missing dependency or a mutated input); E6 out-of-order async responses; E8 a failed request leaves the UI loading forever or swallows the error.

QUALITY BAR (a run that misses any of these is a failed run)
Q1 Every bug is observable on screen within three steps of its ticket, every time. If the only way to know is to read the code, redesign it.
Q2 Every bug is compound, per the card: an obvious patch hides the symptom while leaving the cause, and the real fix is one step deeper. The key's "Looks right but isn't" names the patch and why it fails; the check test should fail the patch where possible (a stale-closure `[]` patch, a consumer-site coercion).
Q3 Prefer symptoms where two parts of the UI disagree.
Q4 Ordinary architecture: no effect chains, no state machines built from useEffect, idiomatic code that would pass review around each bug.
Q5 Exactly three bugs. Hunt for accidental ones (StrictMode double effects with side effects, index keys you didn't intend, loops) and remove them.
Q6 Advisor-portal domain, realistic names, 2026 dates, USD.
Q7 Fixes are coherent with their layer. The server is off limits; wire-format misbehavior lives in server.ts and the fix lives in client.ts or a component. Never call a change invalid and then propose an equivalent change one line away.
Q8 Everything outside the three tickets works exactly as the README says; the bugs test asserts it.
Q9 No bug is a one-token typo. The data behind every bug passes through at least one transform (a merge, a normalizer, a derived map, a sort, a reduce, a closure, a serialization boundary), the symptom suggests a different cause than the real one, and the fix has a tempting shallow version and a correct deeper version.

TICKETS (README and BUGS.md; shuffled order)
`**<PREFIX>-<3 digits>. <Title as a PM would write it>**`, then `Reported by: <named PM or advisor>, priority: <urgent | high | medium>`, then a blockquote of two to five first-person sentences with named clients and concrete values, expected vs actual, and exactly one breadcrumb that takes inference to use. No file names, line numbers, or code vocabulary (state, prop, effect, dependency, closure, coerced, hardcoded, re-render, cast). The reporter is not a developer.

KEY.md (open with one line stating what was verified; then, per bug in ticket order)
`## <n>. <Category>: <mechanism in plain words> (<TICKET-ID>)`, then **Where** (file and the exact lines, quoted), **Layer**, **Why it breaks** (step by step with actual values traced; explain every ticket detail including the breadcrumb), **Fix** (the corrected lines, plus the second part when the compound ingredient needs one), **Looks right but isn't** (two or three plausible patches, each with exactly why it fails), **Fastest way to find it** (the tool and the exact observation), **The tell**, **Say it like this** (two to four sentences naming the mechanism precisely), **Production angle**. Then `## Not bugs (in case you went looking)` with three to five real decoys and why each is fine. Then `## Generator QA` with each line marked PASS only after you checked it: clean load; typecheck; tickets reproduce; surface patch and root fix explained; independent and no accidental bugs; no comments or names point at a bug; tickets have no code vocabulary; decoys present; line count in range; classes match the card.

EXECUTION
1. Read the card and the two reference reps. 2. Write the rep. 3. `npm run typecheck`. 4. `TZ=America/New_York npm run verify NN` must pass (bugs reproduce, page works). 5. Write `.verify/solution/` and `TZ=America/New_York npm run solution NN` must pass. 6. If anything fails, fix the project or the key and rerun until all three pass. Never weaken a test to make it pass; the tests are the standard. 7. Write KEY.md last. Do not print KEY.md or describe the bugs in chat. 8. Finish with three lines: the path, the page name, and "npm run rep NN, open BUGS.md, start a 30-minute timer".
