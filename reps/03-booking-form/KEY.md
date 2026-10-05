# Answer key: rep 03 (New booking). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 03`, `npm run solution 03`). Classes: R1 (React mechanics), T6 (TypeScript lie), D1 (logic). Tickets are in shuffled order.

## 1. React mechanics: state mutated in place (BKG-402)

**Where:** `App.tsx`, `handleAddRoom`:
```ts
rooms.push({ type: "standard", guests: 2 });
setRooms(rooms);
```
The second symptom lives in `components/Summary.tsx`: `useMemo(() => ..., [rooms, roomTypes])`.

**Layer:** rendering, specifically React's identity check on state.

**Why it breaks:** `setRooms(rooms)` passes the same array reference React already holds. React compares with `Object.is`, sees no change, and skips the render, so the new row doesn't appear. Changing the check-out date re-renders the app for an unrelated reason, and now the list maps over the mutated array, so two rows show. But `Summary`'s `useMemo` depends on `rooms`, and `rooms` is still the same reference, so the memo never recomputes: "1 room, 2 guests" and a one-room estimate. The review step is right because the quote endpoint receives the array's current contents. That's the ticket's breadcrumb: the data is there, two views disagree about it.

**Fix:** produce a new array:
```ts
const handleAddRoom = () => {
  setRooms((current) => [...current, { type: "standard", guests: 2 }]);
};
```
**Looks right but isn't:**
- `rooms.push(...); setRooms([...rooms])`: a new reference, so it renders and the memo recomputes. But the mutation of the previous state is still there, and any consumer holding the old array (a memoized child, a "previous rooms" ref for undo, the quote effect's closure) now sees a changed array that it thinks is unchanged. Works today, bites later.
- Adding `rooms.length` to the memo deps: the memo recomputes, the row still doesn't appear until an unrelated render.
- A `tick` state incremented after the push to force a render: the render happens, the memo stays stale, and you've invented an unmemoized memo.

**Fastest way to find it:** React DevTools, select `App`, watch the `rooms` hook after clicking Add room: the array shows two entries but no render happened (no flash with "Highlight updates"). Then read the handler for a `.push` on state.

**The tell:** an action does nothing until an unrelated action, and a memoized summary disagrees with a list rendered from the same data. That's a same-reference state update.

**Say it like this:** "`push` mutates the array React is holding, then `setRooms` gets the same reference, so React bails out. The date change re-renders for its own reason, but the memo in Summary keys on the reference and never recomputes. New array via the functional updater; never mutate state."

**Production angle:** `readonly Room[]` in the state type makes `push` a compile error. Immer or a reducer for list state.

## 2. TypeScript lie: a nullish default that turns a failure into a number (BKG-407)

**Where:** `api/client.ts`, `fetchQuote` returns `Promise<Quote | null>` and swallows the status:
```ts
if (!res.ok) return null;
```
and `components/ReviewStep.tsx`:
```ts
const nightlyTotal = quote?.nightlyTotal ?? 0;
const taxes = quote?.taxes ?? 0;
const total = quote?.total ?? 0;
```
**Layer:** data at the API boundary, hidden by defaults. The server said no (422 with a reason); the client said "zero."

**Why it breaks:** For 21 nights the server answers 422 with "Stays over 14 nights need a manual quote." `fetchQuote` turns any non-ok response into `null`, discarding the reason. `null` is a legal `Quote | null`, so the compiler is satisfied. The review step then reads `quote?.total ?? 0`, which was written for the "not loaded yet" case and now also covers "the server refused." Every number is 0, nothing is logged, and Confirm is enabled because `loading` is false and nothing else gates it. A two-week stay is fine because the server accepts it.

**Fix:** make failure a distinct state that the UI has to handle, and gate Confirm on having a quote:
```ts
// client.ts
export class QuoteError extends Error {}
export async function fetchQuote(...): Promise<Quote> {
  const res = await apiFetch(`/api/quote?${params}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new QuoteError(body?.message ?? `Quote failed (${res.status})`);
  }
  return res.json();
}
```
```tsx
// ReviewStep.tsx: a quoteError state set in .catch, "Unavailable" instead of $0.00 when there's no quote,
// the server's message shown in a role="alert", and disabled={loading || submitting || !quote} on Confirm.
```
**Looks right but isn't:**
- Replacing `?? 0` with `?? "--"` in the display: no fake total, but the reason is still thrown away, Confirm is still enabled, and the user doesn't know what to do.
- Capping the check-out date at 14 nights in the form: avoids this error and hides the whole class. The next server rule (blackout dates, sold-out room types) comes back as $0.00 again.
- Disabling Confirm when `total === 0`: a real quote can't be zero today, but you're encoding a server rule in the client and still not telling the user why.
- Changing the server to return 200 with zeros: the backend was right to refuse.

**Fastest way to find it:** the Network tab (or a `console.log(res.status)` in `fetchQuote`): a 422 with a message that never reaches the screen. In DevTools, `ReviewStep`'s `quote` state is `null` while `loading` is `false`.

**The tell:** zeros where a number can't be zero, no error anywhere, and a boundary the data crossed. Look for `?? 0`, `?? ""`, `?.` on something that can fail, and a client function that returns null on `!res.ok`.

**Say it like this:** "The client collapses a 422 into null and the component defaults null to zero, so a refusal renders as a free stay. Those are two different states and the type should say so: throw with the server's message, catch it into an error state, show it, and don't enable Confirm without a quote."

**Production angle:** a discriminated result type at the boundary (`{ ok: true, quote } | { ok: false, reason }`) so the compiler forces every consumer to handle the failure branch.

## 3. Logic: sort mutates the shared array (BKG-411)

**Where:** `components/RoomsStep.tsx`, `CompareTable`:
```ts
const rows = cheapestFirst ? roomTypes.sort((a, b) => a.price - b.price) : roomTypes;
```
**Layer:** plain logic with a shared reference. `Array.prototype.sort` sorts in place and returns the same array.

**Why it breaks:** `roomTypes` is the array held in `App` state and passed to the comparison table, the room dropdowns, and the summary. Ticking "cheapest first" sorts that array in place. Unticking renders `roomTypes` again, which is now permanently in price order. The dropdown reads the same array, so the next time it re-renders (after the date change) its options are in price order too. That's the breadcrumb: a second view changed for no reason of its own.

**Fix:** sort a copy:
```ts
const rows = cheapestFirst ? [...roomTypes].sort((a, b) => a.price - b.price) : roomTypes;
```
or `roomTypes.toSorted(...)` where the target supports it.

**Looks right but isn't:**
- Sorting back by `maxGuests` when the box is unticked: restores this table, but the shared array is still mutated for everyone else, and "by size" was the API's order, not a guaranteed sort key.
- `reverse()` to undo: reverse is not the inverse of a sort.
- Fetching the room types again on untick: a network round trip to undo a client mutation.

**Fastest way to find it:** React DevTools, select `App`, look at `roomTypes` after ticking the box: the state array itself is reordered though no setter ran. Search the code for `.sort(` and `.reverse(`.

**The tell:** a toggle that won't toggle back, plus an unrelated list reordering itself. In-place sort on shared data.

**Say it like this:** "`sort` mutates and returns the same array, so the table sorted the state array in place and every consumer of it changed. Copy before sorting. The order wasn't lost in the table, it was lost in the shared data."

**Production angle:** `readonly RoomType[]` on props makes `.sort` a compile error; `toSorted` where the browser target allows.

## Not bugs (in case you went looking)

- `validateTraveler` runs on every render: cheap and pure, and the errors only show once a field is touched. Per spec.
- `key={index}` on `RoomRow`: rooms are never reordered or removed on this page, and every field is controlled, so index keys are acceptable here. Worth saying out loud that you'd switch to ids if either changed.
- `JSON.parse(String(init.body))` in `server.ts`: that's the backend reading a request body.
- The quote effect depends on `rooms`, so with bug 1's mutation it wouldn't refetch; once bug 1 is fixed the dependency works. That's a consequence, not a fourth bug.
- `Math.round(x * 100) / 100` in the server's taxes: the backend rounding to cents.

## Generator QA
- Page renders on load with no console errors: PASS (jsdom run)
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 03`)
- Surface patch and root fix explained for each: PASS
- Independent, no accidental extra bugs: PASS (`npm run solution 03`, plus validation and confirm flows)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: R1, T6, D1: PASS
