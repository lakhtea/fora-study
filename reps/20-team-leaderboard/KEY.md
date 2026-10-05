# Answer key: rep 20 (Team leaderboard). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 20`, `npm run solution 20`). Classes: M2 (React mechanics), T5 (TypeScript lie), D1 (logic). Tickets are in shuffled order.

## 1. React mechanics: a context value rebuilt every render, carrying a clock (LDB-410)

**Where:** `App.tsx`:
```tsx
const [now, setNow] = useState(Date.now());   // ticks every second
...
<BoardContext.Provider value={{ period, rows, rankById, secondsSinceUpdate }}>
```
and `components/BoardRow.tsx`, memoized, calling `useBoard()`.

**Layer:** rendering, specifically how context propagates.

**Why it breaks:** Every consumer of a context re-renders when the provider's `value` changes identity, and `memo` can't stop it, because context updates bypass props. The value is an object literal built in `App`'s render, so it's new on every render, and `App` renders every second because the clock state lives there. Every row re-renders every second, pays its cost, and the board repaints. The rows read only `period`, which never changes on a tick.

**Fix:** keep the clock out of the board's value and memoize what's left:
```tsx
const board = useMemo(() => ({ period, rows, rankById }), [period, rows]);
<BoardContext.Provider value={board}>
```
with the ticking clock moved into its own small component (`UpdatedClock`) that owns `now`, so `App` doesn't re-render per tick at all.

**Looks right but isn't:**
- `useMemo` on the value with `secondsSinceUpdate` still inside it: a new object every second anyway, so nothing changes.
- A custom `propsAreEqual` on `BoardRow`: context updates don't go through props; memo is irrelevant here.
- Splitting into two contexts, one for the clock: works if the rows don't consume the clock context; it's the heavier version of moving the clock into its own component.

**Fastest way to find it:** React DevTools Profiler, "Record why each component rendered": every `BoardRow` shows "context changed" once a second. Or watch `data-renders`.

**The tell:** memoized children re-rendering on a timer they don't use. A context value that changes identity, or carries fast-changing state.

**Say it like this:** "The provider's value is a new object every render, and the clock lives in the same component, so every consumer re-renders every second regardless of memo. Memoize the value and move the fast-changing state out of the context, ideally out of the provider's component entirely."

**Production angle:** keep high-frequency state out of shared context; a store with selectors for anything that updates often.

## 2. TypeScript lie: an index signature that promises every advisor is ranked (LDB-414)

**Where:** `types.ts`: `export type RankById = Record<number, RankedRow>;` and `components/MyRank.tsx`: `const mine = rankById[viewAsId]; ... mine.position`.

**Layer:** data consistency between the advisor list and the ranked rows, hidden by a type.

**Why it breaks:** `Record<number, RankedRow>` types every lookup as a row. The map is built from the ranked rows only; Priya has no bookings and no row. `rankById[7]` is `undefined`, `.revenue` and `.position` throw during render, and the page blanks. Everyone on the board works because the lookup hits.

**Fix:** let the type admit the miss and render it:
```ts
export type RankById = Partial<Record<number, RankedRow>>;
{mine ? <>#{mine.position} ...</> : <>Not ranked yet this {period}. Close your first booking to join the board.</>}
```
**Looks right but isn't:**
- `rankById[viewAsId] ?? rows[rows.length - 1]`: shows the last-place advisor's numbers as Priya's.
- Filtering the "View as" dropdown to ranked advisors: new advisors are the page's audience; hiding them is the opposite of the fix.
- `mine?.position ?? "-"`: no crash, blank card, no explanation.

**Fastest way to find it:** the console: "Cannot read properties of undefined (reading 'revenue')" in `MyRank`. DevTools: `rankById` has six keys, the dropdown has seven advisors.

**The tell:** a crash for one option where the lookup table was built from a subset. The index signature promised what the subset lacks.

**Say it like this:** "The rank map is built from ranked rows but typed as if every advisor id resolves. An unranked advisor's lookup is undefined at runtime. Make it `Partial`, handle the miss, and render 'Not ranked yet' as a real state."

**Production angle:** `noUncheckedIndexedAccess`, or a `Map` with `.get()`.

## 3. Logic: reverse in render on shared data (LDB-419)

**Where:** `components/Board.tsx`:
```ts
const ordered = bottomFirst ? rows.reverse() : rows;
```
**Layer:** plain logic with a shared reference, executed during render.

**Why it breaks:** `reverse()` reverses the array in place and returns the same array, and `rows` is the context's state array shared with `MyRank`. With the box ticked, every render of `Board` reverses the state again: bug 1 makes `Board` render every second, so the order flips every second. `MyRank` reads `rows[0]` as the leader, which is now whoever is last, hence "behind Fatima." Unticking renders `rows` as-is, which is whatever orientation the last flip left it in.

**Fix:** reverse a copy:
```ts
const ordered = bottomFirst ? [...rows].reverse() : rows;
```
**Looks right but isn't:**
- Moving the reverse into the checkbox handler and storing `ordered` in state: no flip on tick, but the state array is still mutated the first time, and the leader is still wrong.
- Sorting by `position` descending instead of reversing: avoids mutation if done on a copy; on the original it's the same bug.
- Fixing bug 1 only: the per-second flip stops, and ticking the box still mutates the state once, so My rank is still wrong and unticking doesn't restore.

**Fastest way to find it:** DevTools, select `App`: `rows` in state reorders itself though no setter ran. Search for `.reverse(` and `.sort(`.

**The tell:** a toggle that bounces, and an unrelated card changing with it. In-place reverse on shared data, in render.

**Say it like this:** "`reverse` mutates the shared state array and runs on every render, so each render flips it again and the rank card reads the flipped array. Reverse a copy; display order is a view, not a change to the data."

**Production angle:** `readonly RankedRow[]` in the context type makes `.reverse` a compile error; `toReversed` where the target allows.

## Not bugs (in case you went looking)

- `Math.max(0, ...)` on the seconds guards the first tick before the data arrives.
- `rankById` is rebuilt from `rows` each render in the buggy file; cheap for six rows, and it moves inside the memo in the fix.
- `BoardRow` reads `period` from context on purpose: the movement label depends on it.
- `rows.length === 0` as the loading gate is fine because a period always has rows.
- The quarter and month boards have different orders, which is why the sanity test checks the leader after switching.

## Generator QA
- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 20`)
- Surface patch and root fix explained for each: PASS
- Independent, no accidental extra bugs: PASS (`npm run solution 20`; a negative clock reading found during generation was fixed before shipping)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: M2, T5, D1: PASS
