# Answer key: rep 24 (Hackathon votes). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 24`, `npm run solution 24`). Classes: E4 (React mechanics), T4 (TypeScript lie), E6 (async ordering). Tickets are in shuffled order.

## 1. React mechanics: an interval started in an effect and never cleared (HCK-410)

**Where:** `App.tsx`:
```ts
useEffect(() => {
  const load = () => { ... fetchProjects(category).then(...) };
  load();
  setInterval(load, 1500);
}, [category]);
```
**Layer:** rendering lifecycle: effect setup without teardown.

**Why it breaks:** Every category change reruns the effect, which starts another interval, and nothing stops the previous one. After two switches there are three intervals, each polling its own category on every tick and each calling `setProjects` with its category's rows: the counter climbs three at a time and the list flashes between categories. The initial single interval is the steady tick the ticket remembers.

**Fix:** return the teardown:
```ts
const handle = setInterval(load, 1500);
return () => clearInterval(handle);
```
(The acceptance version also sets a `cancelled` flag in the same cleanup; that's bug 3's fix sharing the effect.)

**Looks right but isn't:**
- `[]` as the dependency array: one interval forever, polling the initial category; switching categories loads once and then the counts never refresh.
- Keeping the interval in a ref and clearing it at the top of the effect before starting a new one: works, by hand-rolling what cleanup does.
- Guarding `setProjects` with a category check: hides the flicker, keeps every interval running.

**Fastest way to find it:** the Polls counter, or `console.log("start", category)` in the effect with no matching "stop." DevTools: the effect has no cleanup.

**The tell:** a periodic action that speeds up with unrelated interactions. Interval without cleanup.

**Say it like this:** "The effect starts an interval on every category change and never clears the previous one, so intervals accumulate. Return a cleanup that clears the handle."

**Production angle:** a `useInterval` hook, or TanStack Query's `refetchInterval` keyed by category, which owns the lifecycle.

## 2. TypeScript lie: Title Case literals against a lowercase wire (HCK-414)

**Where:** `types.ts`: `VoteState = "Open" | "Voted"`; `components/ProjectList.tsx` renders the button when `voteState === "Open"` and the badge when `"Voted"`; the backend sends `open` and `voted`.

**Layer:** data at the API boundary. The union's literals were typed from memory.

**Why it breaks:** `res.json()` is `any`, so the declared union is never checked. Every project arrives with a lowercase state, neither comparison matches, and the component falls through to `null`: no button, no badge. The vote counts are right because they're numbers.

**Fix:** match the wire and narrow on those literals:
```ts
export type VoteState = "open" | "voted";
project.voteState === "voted" ? badge : project.voteState === "open" ? button : null
```
and the optimistic update in `handleVote` uses the same lowercase literals.

**Looks right but isn't:**
- `voteState.toLowerCase() === "open"`: works, and the union still lies; the next comparison (a "voted" filter) breaks again.
- Rendering the Vote button for everything not `"Voted"`: shows a Vote button on the project you voted for.
- Asking the server for Title Case: the enum is fine.

**Fastest way to find it:** DevTools, `projects[0].voteState` is `"open"`. Every comparison is against a value the data never has.

**The tell:** a feature that never renders for any item. Literals in the type that the API doesn't produce.

**Say it like this:** "The union says Title Case, the API sends lowercase, and `any` let it through; every comparison fails. Align the union with the wire, including the optimistic update."

**Production angle:** generate types from the API schema; validate with `z.enum` at the boundary.

## 3. Async ordering: the biggest category lands last (HCK-419)

**Where:** the same effect: `fetchProjects(category).then((rows) => setProjects(rows))` with no guard.

**Layer:** async ordering.

**Why it breaks:** Latency grows with the number of projects (`80 + n * 100` ms): Advisor tools (six) takes about 680 ms, Client experience (three) about 380 ms. Click them in that order and the Client experience response lands first, then Advisor tools overwrites it under the wrong heading. Nothing checks whether the response still belongs to the current category.

**Fix:** a cancelled flag per effect run, set in cleanup, checked when the promise resumes:
```ts
let cancelled = false;
... .then((rows) => { if (!cancelled) setProjects(rows); });
return () => { cancelled = true; clearInterval(handle); };
```
Say it precisely: the request completes; the guard blocks the state write.

**Looks right but isn't:**
- Disabling the category buttons while loading: no race, and the biggest category locks the UI.
- Comparing `rows[0].category === category` in `.then`: the `category` in that closure is the request's own, so it always matches.
- Fixing bug 1 alone: the intervals stop accumulating, and the first load of each category still races.

**Fastest way to find it:** `console.log(category, rows.length)` in `.then`: two logs, the second for the earlier category.

**The tell:** wrong only when two actions happen fast, and the big payload wins. Ordering.

**Say it like this:** "Two requests overlap and the slower one is the older one, so it writes last. A per-run cancelled flag set in the same cleanup that clears the interval stops a superseded request from writing."

**Production angle:** TanStack Query keyed by category, which cancels, caches, and polls.

## Not bugs (in case you went looking)

- `handleVote` adjusts the previous "Your vote" project's count locally so the UI doesn't wait for the next poll. Correct, once the literals match.
- `setPolls((n) => n + 1)` uses the functional updater, so the counter is right even with overlapping calls.
- `pollsServed` in `server.ts` is server state for the tests.
- `aria-pressed` on the category buttons marks the active tab.
- The default category is Internal (the smallest) so the page loads fast; it's also what makes bug 3 easy to reproduce.

## Generator QA
- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 24`)
- Surface patch and root fix explained for each: PASS
- Independent, no accidental extra bugs: PASS (`npm run solution 24`)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: E4, T4, E6: PASS
