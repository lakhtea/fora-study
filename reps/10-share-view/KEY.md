# Answer key: rep 10 (Client share view). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 10`, `npm run solution 10`). Classes: R4 (React mechanics), T6 (TypeScript lie), E6 (async ordering). Tickets are in shuffled order. (The rep card listed R5 for this slot; in a TypeScript codebase `onClick={fn()}` is a compile error unless the handler returns `any`, so R4 took its place.)

## 1. React mechanics: setState during render (SHR-401)

**Where:** `components/DayItems.tsx`:
```ts
if (showAll) {
  setOpenIds(items.map((item) => item.id));
}
```
in the body of the component, outside any handler or effect.

**Layer:** rendering. State written while React is computing what to render.

**Why it breaks:** Calling a setter during render schedules another render of the same component immediately. The setter receives a brand-new array every time (`items.map` creates one), so React sees a changed value, re-renders, hits the same line, sets another new array, and so on. React gives up after 50 nested updates and throws "Too many re-renders," which unmounts the tree. The page loads fine because `showAll` starts false; the loop starts the moment the box is ticked. Opening details one at a time goes through the click handler, which is the right place for state updates.

**Fix:** don't store what you can derive. "Show all" is a view rule, not a change to the open set:
```ts
const isOpen = (id: number) => showAll || openIds.includes(id);
```
and use `isOpen(item.id)` in both places. Unticking returns to the individually opened set, which is what users expect.

**Looks right but isn't:**
- Adding a guard, `if (showAll && openIds.length !== items.length)`: the loop stops after one extra render, and it's still state written during render. The React docs allow "adjusting state while rendering" with a previous-value comparison, but this isn't adjusting, it's mirroring, and unticking the box leaves every item open.
- Moving it into `useEffect(() => { if (showAll) setOpenIds(all) }, [showAll, items])`: no crash, one render late, and the same unticking problem; derived state in an effect.
- Setting all ids in the checkbox's `onChange`: works for ticking; items that load after the tick aren't included.

**Fastest way to find it:** the console: "Too many re-renders. React limits the number of renders to prevent an infinite loop," with `DayItems` in the stack. Search the component body for a setter outside a handler or effect.

**The tell:** an action that crashes with "Too many re-renders" means a setter running during render with a value that's never equal to the last one.

**Say it like this:** "The component calls `setOpenIds` during render with a new array each time, so every render schedules another one until React throws. Show-all is derivable from `showAll` and `openIds`, so I'll compute `isOpen` instead of storing it. If state really had to change on a render, it would be a previous-value comparison, not a mirror."

**Production angle:** derive, don't sync; the React Compiler and the `react-hooks` lint rules both flag setters in render.

## 2. TypeScript lie: a null that stands for "failed" and renders as "empty" (SHR-404)

**Where:** `api/client.ts`:
```ts
export async function fetchShare(token: string): Promise<ShareView | null> {
  const res = await apiFetch(`/api/share/${token}`);
  if (!res.ok) return null;
```
and `App.tsx`: `share?.title ?? "Your itinerary"`, `share?.days ?? []`, `share?.advisor.name ?? "Your Fora advisor"`.

**Layer:** data at the API boundary, with failure encoded as absence.

**Why it breaks:** The backend answers an expired link with 410 and a sentence that explains it. `fetchShare` turns every non-ok response into `null`, discarding the status and the message. `null` is a legal `ShareView | null`, so the compiler is content. The page then treats `null` as "nothing to show": default title, empty days, "No days planned yet," a nameless advisor. Every `?.` and `??` in the page was written for the loading case and now also covers failure. The client reads it as a deleted trip.

**Fix:** make failure its own path with the server's message:
```ts
export class ShareUnavailable extends Error {}
export async function fetchShare(token: string): Promise<ShareView> {
  const res = await apiFetch(`/api/share/${token}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new ShareUnavailable(body?.message ?? `This link can't be opened (${res.status})`);
  }
  return res.json();
}
```
and in `App`, catch into an `unavailable` state rendered as a `role="alert"` instead of the itinerary.

**Looks right but isn't:**
- Showing "Itinerary unavailable" when `share` is null: better than "No days planned," and it throws away the reason the server gave. Expired, not found, and revoked each need different advice.
- Checking `days.length === 0` to show a message: a real itinerary with no days yet gets an "expired" message.
- Redirecting expired links on the backend: the API already answers correctly; the client ignored it.

**Fastest way to find it:** the Network panel (or `console.log(res.status)` in `fetchShare`): a 410 with a message that never reaches the page. DevTools: `share` is `null` while `loading` is `false`.

**The tell:** a failure that renders as an empty success. Look for a client function that returns null on `!res.ok` and for `?? default` on the result.

**Say it like this:** "The client collapses a 410 into null and the page defaults null to an empty itinerary, so an expired link looks like a deleted trip. Failure and absence are different states; throw with the server's message, catch it into state, and render it."

**Production angle:** a discriminated result at the boundary so the compiler forces every consumer to handle the failure branch.

## 3. Async ordering: the slower request is the older one (SHR-408)

**Where:** `components/DayItems.tsx`:
```ts
useEffect(() => {
  setLoading(true);
  fetchDayItems(token, dayIndex).then((rows) => {
    setItems(rows);
    setLoading(false);
  });
}, [token, dayIndex]);
```
**Layer:** async ordering.

**Why it breaks:** The backend's latency grows with the number of items (`100 + items * 120` ms): Day 1 has five items (about 700 ms), Day 3 has one (about 220 ms). Click Day 1 then Day 3: the Day 3 response lands first and sets the right list, then Day 1's response lands and overwrites it. Nothing checks whether a response still belongs to the current day. The heading comes from props, so it says Day 3; the list comes from the stale response. Clicking slowly leaves no overlap, which is the breadcrumb.

**Fix:** ignore responses from superseded runs:
```ts
useEffect(() => {
  let cancelled = false;
  setLoading(true);
  fetchDayItems(token, dayIndex).then((rows) => {
    if (cancelled) return;
    setItems(rows);
    setLoading(false);
  });
  return () => { cancelled = true; };
}, [token, dayIndex]);
```
Say the mechanism precisely: the request completes anyway; the guard blocks the state write when the promise resumes after the day changed. An `AbortController` would also stop the work.

**Looks right but isn't:**
- Disabling the day picker while loading: no race, and a slow day locks the UI.
- Comparing `rows[0].id` against something: the data doesn't carry the day, and the closure's `dayIndex` is the one the request started with, so it always matches.
- Keying `DayItems` by `dayIndex` so it remounts per day: the old instance unmounts, its promise still resolves and calls `setItems` on an unmounted component (React 18 drops it silently). It happens to work, by accident, and the cleanup rule is the real fix.

**Fastest way to find it:** `console.log(dayIndex, rows.length)` inside `.then`: two logs, the second one for the earlier day. DevTools shows `items` flipping from one row to five about half a second after the click.

**The tell:** wrong only when two actions happen fast, fine when you wait, and the big payload "wins." Ordering.

**Say it like this:** "Two requests overlap and the slower one is the older one, so it writes last. Each effect run gets a cancelled flag set in cleanup, checked when the await resumes, so a superseded request can't write state."

**Production angle:** TanStack Query keyed by `["day", token, dayIndex]`, which cancels and caches, so switching back to Day 1 is instant.

## Not bugs (in case you went looking)

- The share fetch in `App` already has a cancelled flag, so switching preview links quickly is safe.
- `setSelectedDay(0)` after loading a share resets the picker for a new link. Deliberate.
- `openIds` is per `DayItems` instance and resets when the day changes, because the component re-renders with new items but keeps state; that's acceptable here and worth a sentence if you notice it.
- The `Preview as` dropdown is a development aid standing in for the URL. The real page reads the token from the route.
- `aria-pressed` on the day buttons is the accessible way to mark the selected day.

## Generator QA
- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 10`)
- Surface patch and root fix explained for each: PASS
- Independent, no accidental extra bugs: PASS (`npm run solution 10`)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: R4, T6, E6: PASS
