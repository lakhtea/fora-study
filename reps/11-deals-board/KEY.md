# Answer key: rep 11 (Supplier deals). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 11`, `npm run solution 11`). Classes: R2 (React mechanics), T2 (TypeScript lie), D1 (logic). Tickets are in shuffled order.

## 1. React mechanics: reading state right after setting it (DLS-220)

**Where:** `App.tsx`, `toggleTray`:
```ts
setTray(inTray ? tray.filter(...) : [...tray, deal]);
setTrayCount(tray.length);
```
**Layer:** rendering, specifically when state updates become visible.

**Why it breaks:** `setTray` doesn't change `tray` in this function. State updates are applied on the next render; within the handler, `tray` is still the array from the render that created the handler. So `tray.length` is the old length, and `trayCount` is always one step behind. The tray panel reads `deals.length` from the prop, which is the new array on the next render, so it's right. Two numbers, one source of truth, one copy.

**Fix:** don't keep a copy. Derive the badge:
```ts
Tray: {tray.length}
```
and drop `trayCount` entirely. While you're there, use the functional updater so the toggle is correct even if two clicks land in one batch:
```ts
setTray((current) => (current.some((d) => d.id === deal.id) ? current.filter((d) => d.id !== deal.id) : [...current, deal]));
```
**Looks right but isn't:**
- `setTrayCount(inTray ? tray.length - 1 : tray.length + 1)`: correct arithmetic, still two states for one fact, and the next place that changes the tray (an "empty tray" button) has to remember to update both.
- `useEffect(() => setTrayCount(tray.length), [tray])`: correct, one render late, and derived state in an effect.
- Computing `next` first and setting both: fine for this handler; the duplicate state remains.

**Fastest way to find it:** React DevTools, select `App`: `tray` has two entries, `trayCount` is 1. Two hooks that should agree and don't.

**The tell:** a count that's always exactly one behind the list it counts. State read in the same handler that set it.

**Say it like this:** "`setTray` schedules an update; `tray` in the handler is still the old array, so the count copies the previous length. The badge shouldn't be state at all; derive it from the tray. One source of truth, no sync."

**Production angle:** derive everything derivable; `useReducer` when several fields change together.

## 2. TypeScript lie: the response shape isn't the declared shape (DLS-224)

**Where:** `api/client.ts`, `fetchDeals` returns `res.json()` as `Promise<Deal[]>` where `validUntil: string`; the backend sends `validUntil: { date, tz }`. The symptom is in `components/DealCard.tsx`: `` `Valid until ${deal.validUntil}` ``.

**Layer:** data at the API boundary. The type described what someone wished the API sent.

**Why it breaks:** `res.json()` is `Promise<any>`, so the declared `Deal[]` is never checked. The deals feed sends validity as an object (the date and the supplier's timezone). A template literal stringifies an object as `[object Object]`. The other fields are strings and numbers, so the card is otherwise fine, which is the breadcrumb.

**Fix:** map the wire shape to the app shape where the data enters:
```ts
interface DealWire extends Omit<Deal, "validUntil"> { validUntil: { date: string; tz: string }; }
const rows = (await res.json()) as DealWire[];
return rows.map((row) => ({ ...row, validUntil: row.validUntil.date }));
```
**Looks right but isn't:**
- `deal.validUntil.date` in the card with `as any`: the card works, the type still says string, and the next consumer (a sort by validity, an "expiring soon" filter) breaks the same way.
- Changing the type to the object and updating the card: honest, and fine if the timezone matters to the UI; it pushes the mapping into every render site.
- Asking the backend to send a string: the feed shape is what it is, and the timezone is useful.

**Fastest way to find it:** DevTools, open a deal in `deals` state: `validUntil: {date: "2026-11-30", tz: "Europe/Lisbon"}`. `[object Object]` on screen is always an object that met string conversion.

**The tell:** `[object Object]`. In a typed codebase it means the type lied at a boundary.

**Say it like this:** "`res.json()` returns any, so the declared string was never checked against the feed, which sends an object. Map it at the boundary so the app type is true everywhere; a runtime schema would enforce it."

**Production angle:** a Zod schema per endpoint, with wire types and app types kept separate on purpose.

## 3. Logic: sort mutates the array feeding two views (DLS-229)

**Where:** `App.tsx`:
```ts
const visible = byDiscount ? filtered.sort((a, b) => b.discountPercent - a.discountPercent) : filtered;
```
**Layer:** plain logic with a shared reference.

**Why it breaks:** With "All categories" selected, `filtered` is `deals` itself, the state array. `sort` reorders it in place and returns the same array, so the sorted view and the state are the same object. `FeaturedStrip` slices the first three of `deals`, so it now shows the top discounts. Unticking renders `filtered` again, which is the mutated array, so nothing goes back. (With a category selected, `filter` returns a new array, so the strip survives; that's why it "sometimes" works, if anyone noticed.)

**Fix:** sort a copy:
```ts
const visible = byDiscount ? [...filtered].sort((a, b) => b.discountPercent - a.discountPercent) : filtered;
```
**Looks right but isn't:**
- Keeping a separate `originalDeals` state to restore from: two copies of the same data to work around a mutation.
- Sorting back by id when unticked: restores this view; the state is still mutated for everyone else, and "the supplier team's order" isn't id order.
- Refetching on untick: a round trip to undo a client mutation.

**Fastest way to find it:** React DevTools, select `App`, tick the box: the `deals` state array itself reorders though no setter ran. Search for `.sort(`.

**The tell:** a toggle that won't toggle back and an unrelated view reordering itself. In-place sort on shared data.

**Say it like this:** "`sort` mutates and returns the same array, and with no filter that array is the state itself, so the featured strip and the untoggled view both change. Copy before sorting; sorting is a view, not a change to the data."

**Production angle:** `readonly Deal[]` on state and props makes `.sort` a compile error; `toSorted` where the target allows.

## Not bugs (in case you went looking)

- `deals.filter(...)` returns a new array, which is why the strip survives when a category is selected.
- `tray.some(...)` inside the map runs on every render; eight deals, no cost.
- `onToggle` passed to every `DealCard` is a new function per render; the cards aren't memoized, so it doesn't matter.
- The featured strip reads `deals`, not `visible`, on purpose: it must ignore the filter and the sort.
- The tray count in the panel heading reads `deals.length` from props. Correct, and it's the honest number in bug 1.

## Generator QA
- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 11`)
- Surface patch and root fix explained for each: PASS
- Independent, no accidental extra bugs: PASS (`npm run solution 11`)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: R2, T2, D1: PASS
