# Answer key: rep 07 (Trips timeline). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 07`, `npm run solution 07`). Classes: E5 (React mechanics), T7 (TypeScript lie), D4 (logic). Tickets are in shuffled order.

## 1. React mechanics: a delay, not a debounce (TRP-911)

**Where:** `components/SearchBox.tsx`:
```ts
useEffect(() => {
  setTimeout(() => onSearch(draft), 300);
}, [draft, onSearch]);
```
**Layer:** rendering lifecycle: effect without cleanup, which here means timers that are never cancelled.

**Why it breaks:** Every keystroke changes `draft`, the effect runs, and a new 300 ms timer is scheduled. Nothing cancels the previous one, so six keystrokes schedule six timers and each fires `onSearch` with the draft it captured: "l", "li", "lis", and so on. Each distinct query sets state and triggers a request, which is why the counter climbs by one per letter and the list flickers through partial results. A debounce is a delay plus cancellation of the previous timer; this code has the delay only.

**Fix:** cancel the pending timer in the cleanup:
```ts
useEffect(() => {
  const handle = setTimeout(() => onSearch(draft), 300);
  return () => clearTimeout(handle);
}, [draft, onSearch]);
```
**Looks right but isn't:**
- `return clearTimeout(handle)`: that calls `clearTimeout` immediately and returns `undefined` as the cleanup, so the timer is cancelled before it ever fires and nothing searches at all. Cleanup must be a function. This was one of your own logged bug classes; say it out loud if you see it.
- A `loading` guard that skips `onSearch` while a request is in flight: fewer requests, but still one per keystroke after each response, and now a keystroke during a request is dropped.
- Raising the delay to 1000 ms: the same number of requests, later.
- Debouncing on the server: the backend can't cancel client timers.

**Fastest way to find it:** the "Requests sent" counter, or a `console.log` inside the timer callback showing it fires once per keystroke with growing drafts. In DevTools, `query` in `App` changes six times.

**The tell:** one action per keystroke, each delayed by the same amount. Timers scheduled and never cleared.

**Say it like this:** "The effect schedules a timer on every draft change and never cancels the previous one, so it's a delay, not a debounce. Returning a cleanup that clears the handle makes each keystroke cancel the last timer, so only the final draft fires. Returning `clearTimeout(handle)` directly would be the opposite bug."

**Production angle:** a `useDebouncedValue(draft, 300)` hook, and the network call still guarded against out-of-order responses.

## 2. TypeScript lie: two optional names for one prop (TRP-914)

**Where:** `components/TripDrawer.tsx`:
```ts
interface TripDrawerProps { trip: Trip; onClose?: () => void; onDismiss?: () => void; }
export function TripDrawer({ trip, onDismiss }: TripDrawerProps) {
  ... onClick={() => onDismiss?.()}
```
and `App.tsx` passes `onClose={() => setSelectedId(null)}`.

**Layer:** component contract. The parent and the child agreed on different names, and the types let both be optional.

**Why it breaks:** The props interface accepts both `onClose` and `onDismiss`, both optional (a rename that was never finished). The parent passes `onClose`; the button calls `onDismiss?.()`, which is `undefined`, so optional chaining makes it a silent no-op. No error, no warning, nothing in the console, which is the breadcrumb. Opening a different trip works because that path doesn't go through the drawer's button.

**Fix:** one name, required, so the compiler enforces the contract:
```ts
interface TripDrawerProps { trip: Trip; onClose: () => void; }
export function TripDrawer({ trip, onClose }: TripDrawerProps) { ... onClick={onClose} }
```
**Looks right but isn't:**
- Changing the parent to pass `onDismiss`: the button works, and the interface still accepts two names, both optional. The next caller passes `onClose` and gets the same bug.
- Calling both, `onClose?.(); onDismiss?.()`: works for every caller and cements the confusion.
- Removing the `?.` so it throws: a crash is better than silence, but the contract is still wrong.

**Fastest way to find it:** React DevTools, select `TripDrawer`: props show `onClose` as a function and `onDismiss` absent. Then read what the button calls.

**The tell:** a handler that does nothing with no error is almost always an optional callback that wasn't passed, and optional callbacks with two names mean a rename stopped halfway.

**Say it like this:** "The parent passes `onClose` and the child reads `onDismiss`; both are optional in the props, so the compiler can't see the mismatch and optional chaining swallows the call. Make it one required prop. Optional callbacks should be rare and deliberate."

**Production angle:** required callbacks by default; a lint rule flagging unused destructured props; finish renames in one PR.

## 3. Logic: a date-only string parsed as UTC midnight (TRP-918)

**Where:** `components/Timeline.tsx`:
```ts
function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
```
**Layer:** plain logic on dates: a calendar date treated as an instant.

**Why it breaks:** `new Date("2026-11-03")` parses a date-only ISO string as midnight UTC. `toLocaleDateString` then renders that instant in the viewer's timezone. In New York, midnight UTC on Nov 3 is 7 pm on Nov 2, so the timeline prints "Nov 2". In London (UTC+0 in November), it prints Nov 3, which is the breadcrumb. The drawer uses the shared `formatDate`, which splits the string into year, month, day and builds a local date, so it's right everywhere. Every trip is off by exactly one day for anyone west of UTC.

**Fix:** treat a date-only string as a calendar date, never an instant:
```ts
const [year, month, day] = iso.split("-").map(Number);
return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
```
or reuse `formatDate` from `shared/format` with a shorter options object.

**Looks right but isn't:**
- Adding a day: fixes New York and breaks everyone east of UTC by a day the other way.
- `new Date(iso + "T00:00:00")`: parses as local midnight in modern engines, which works, but relies on a parsing rule that has changed across engines; the split is explicit.
- Formatting with `timeZone: "UTC"`: renders the right calendar day, and now any date that really is an instant renders wrong.
- Asking the backend for timestamps: a trip's start date is a calendar date; a timestamp would need a timezone, which is the problem you'd be creating.

**Fastest way to find it:** `new Date("2026-11-03").toString()` in the console: Nov 2, 19:00 Eastern. The two displays disagree and only one uses `new Date(string)`.

**The tell:** off by exactly one day, only for some people, fine in London. Date-only string through `new Date`.

**Say it like this:** "The timeline parses a date-only string with `new Date`, which is UTC midnight, then formats it in local time, so New York sees the previous evening. The drawer builds a local date from the parts. Treat calendar dates as year, month, day, never as instants."

**Production angle:** a `PlainDate` type (Temporal, or a small wrapper) separate from `Instant`, and one shared formatter so there's only one place to get it wrong.

## Not bugs (in case you went looking)

- `handleSearch` is memoized so `SearchBox`'s effect doesn't rerun every render. Correct, and it's why bug 1 is purely the missing cleanup.
- The effect in `App` has a `cancelled` flag, so out-of-order responses can't overwrite the latest query even while bug 1 sends many requests.
- `[...trips].sort(...)` copies before sorting. Correct.
- `localeCompare` on `YYYY-MM-DD` strings sorts chronologically. Correct.
- The status filter is client-side on purpose; the spec says so.

## Generator QA
- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 07`)
- Surface patch and root fix explained for each: PASS
- Independent, no accidental extra bugs: PASS (`npm run solution 07`)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: E5, T7, D4: PASS
