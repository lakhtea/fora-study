# Answer key: rep 02 (Itinerary editor). Do not open until the timer ends.

Three bugs, one per category, independent. Every fix and every "looks right but isn't" below was checked against this code in a scripted Testing Library run (`npm run verify 02` reproduces all three; `npm run solution 02` applies these fixes and passes the acceptance tests). Classes: E6 (async ordering), T1 (TypeScript lie), L1 (React mechanics). Tickets are in shuffled order.

## 1. Async ordering: out-of-order responses (ITN-311)

**Where:** `components/AddItemPanel.tsx`, the effect on `category`:
```ts
useEffect(() => {
  setLoading(true);
  fetchSuppliers(category).then((rows) => {
    setSuppliers(rows);
    setLoading(false);
  });
}, [category]);
```
**Layer:** async ordering. Two requests in flight, the slower one is the stale one.

**Why it breaks:** The server's latency grows with the number of results (`120 + rows.length * 60` ms). Hotels has 10 rows (about 720 ms); Transfers has 3 (about 300 ms). Click Hotels then Transfers: the Transfers response lands first and sets the list correctly, then the Hotels response lands and overwrites it. Nothing in the `.then` checks whether this response is still the one the UI wants. "If I wait a second it's fine" is the breadcrumb: with no overlap there's no race.

**Fix:** mark each run of the effect and ignore results from a run that has been superseded:
```ts
useEffect(() => {
  let cancelled = false;
  setLoading(true);
  fetchSuppliers(category).then((rows) => {
    if (cancelled) return;
    setSuppliers(rows);
    setLoading(false);
  });
  return () => { cancelled = true; };
}, [category]);
```
Say the mechanism precisely: the request still completes; the guard blocks the state write when the promise resumes after the category has changed. An `AbortController` passed through `apiFetch` would also stop the work, which matters for real network calls.

**Looks right but isn't:**
- Disabling the select while loading: no race, but the user can't correct a misclick until the slow request finishes, and a slow backend freezes the UI.
- Comparing `rows[0].category === category` inside `.then`: `category` there is the closure's value from the render that started the request, so it always matches. Stale closure, same class of bug.
- A debounce on the select: shrinks the window, doesn't close it. Two clicks slower than the debounce still race.
- Sorting responses by request start time on the server: the backend can't fix client ordering.

**Fastest way to find it:** the Network panel or a `console.log(category, rows.length)` in `.then`: two responses, the second one for the earlier category. In DevTools, the `suppliers` state flips from transfers to hotels about half a second after the click.

**The tell:** wrong only when two actions happen quickly, fine when you wait. That's ordering, not logic.

**Say it like this:** "Two requests overlap and the slower one is the older one, so it writes last. The fix is a per-effect cancelled flag checked when the await resumes, so a superseded request can't write state. In production I'd also abort it so the browser stops the work."

**Production angle:** TanStack Query keyed by `["suppliers", category]`, which handles cancellation and caching, or `AbortController` in `apiFetch`.

## 2. TypeScript lie: a non-null assertion on a lookup that can miss (ITN-315)

**Where:** `components/ItemPanel.tsx`:
```ts
const item = items.find((candidate) => candidate.id === selectedItemId)!;
```
and `App.tsx`, `handleRemove`, which removes the item but leaves `selectedItemId` pointing at it.

**Layer:** state consistency, hidden by a type assertion. Two pieces of state (`items`, `selectedItemId`) can disagree, and the `!` told the compiler they never do.

**Why it breaks:** `find` returns `ItineraryItem | undefined`. The `!` erases the `undefined` so `item.title` compiles. When the selected item is removed, `items` no longer contains it, `find` returns `undefined`, and `item.title` throws a TypeError during render, which unmounts the tree (blank page). Removing a different item is fine because the lookup still succeeds. That's the breadcrumb.

**Fix:** two parts. Handle the miss in the panel, and stop the states from disagreeing in the first place:
```ts
// ItemPanel.tsx
const item = items.find((candidate) => candidate.id === selectedItemId);
if (!item) return <div className="panel empty">That item is no longer on the itinerary.</div>;
```
```ts
// App.tsx
const handleRemove = (id: number) => {
  updateItems((items) => items.filter((item) => item.id !== id));
  setSelectedItemId((current) => (current === id ? null : current));
};
```
**Looks right but isn't:**
- Only removing the `!` and returning null: no crash, but `selectedItemId` still points at a deleted item. The next feature that reads it (a "Save note" form, a "Duplicate item" button) acts on a ghost.
- Clearing the selection in a `useEffect` that watches `items`: render runs before the effect, so the crash happens first. Effects run after commit.
- Wrapping the panel in an error boundary: catches the symptom, leaves the inconsistency.
- `items.find(...) ?? items[0]`: shows the wrong item with no indication.

**Fastest way to find it:** the console stack trace names `ItemPanel` and "Cannot read properties of undefined (reading 'title')". Search for `!` on a `find`.

**The tell:** a crash that only happens when two things are both true (selected and removed) means two states that were allowed to disagree, and a `!` is usually what hid it.

**Say it like this:** "`find` can return undefined and the non-null assertion told the compiler it couldn't. The real cause is that removing an item doesn't clear the selection, so the two states disagree. I'll handle the miss in the panel and clear the selection in the same handler that removes the item, because an effect would run after the render that crashes."

**Production angle:** a lint rule against non-null assertions, and derive selection from a single source (store the selected item id and validate it on read, or clear it in every mutation that can invalidate it).

## 3. React mechanics: index keys with an uncontrolled input (ITN-318)

**Where:** `components/DayList.tsx`:
```tsx
{dayItems.map((item, index) => (
  <div className="item" key={index} ...>
    ...
    <textarea rows={1} defaultValue={item.note} ... />
```
**Layer:** rendering (reconciliation). React matched the wrong DOM node to the wrong item.

**Why it breaks:** Keys tell React which element is which across renders. With index keys, after removing the first item, the Four Seasons row is now at index 0, so React reuses the DOM nodes that were rendering the transfer. The title and price are rendered from props every time, so they update. The note textarea is uncontrolled (`defaultValue`), which only sets the value on mount, so the reused node keeps the transfer's text. That's why "the title and price are right, only the note is wrong." A refresh remounts everything, which is the breadcrumb.

**Fix:** key by identity:
```tsx
<div className="item" key={item.id} ...>
```
**Looks right but isn't:**
- Making the textarea controlled (`value={item.note}` + onChange): the note shows correctly, so the ticket closes. But the keys are still wrong, so any other per-row local state or DOM state (focus, scroll, a future animation, a memoized child) will keep following positions instead of items, and reordering with Up and Down will keep reconciling the wrong nodes.
- `key={`${index}-${item.title}`}`: works until two items share a title, and still breaks on reorder of same-titled items.
- `key={Math.random()}`: every render remounts every row, so typing in a note loses focus on each keystroke.

**Fastest way to find it:** React DevTools, Components tab, select a row's textarea before and after the removal: the component instance (and its `key`) stayed at position 0 while its props changed. Or check what `key` is on the map.

**The tell:** a list where derived fields update but DOM-held state (an uncontrolled input, focus, a checkbox) follows the position after a delete or reorder. That's keys.

**Say it like this:** "The rows are keyed by index, so after a removal React reuses the first row's DOM for a different item. The title re-renders from props, but the textarea is uncontrolled and only reads defaultValue on mount, so it keeps the old text. Key by `item.id`. Making the input controlled would hide the symptom and leave the reconciliation wrong."

**Production angle:** a lint rule against array-index keys, and a preference for controlled inputs in editable lists so the data lives in state.

## Not bugs (in case you went looking)

- `let nextItemId = 1000` at module scope in `App.tsx`: fine for a demo. Ids won't collide with the server's.
- `handleMove` swaps positions in the flat `items` array rather than within a per-day array: correct because `dayItems` is derived by filtering, and the test for Up/Down passes.
- `fetchItinerary` runs twice in dev under StrictMode; the cancelled flag makes that harmless.
- The `onBlur` note save means the note doesn't update in the panel until you click away. Per spec.
- `wait(120 + rows.length * 60)` in the server: that's the backend being slow for large lists, which is normal, and it's what makes bug 1 reproducible.

## Generator QA
- Page renders on load with no console errors: PASS (jsdom run)
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 02`)
- Each bug has a surface patch and a root fix explained: PASS
- Independent, no accidental extra bugs: PASS (`npm run solution 02`, including add and move)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: E6, T1, L1: PASS
