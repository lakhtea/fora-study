# Answer key: rep 05 (Commissions). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 05`, `npm run solution 05`). Classes: E4 (React mechanics), T4 (TypeScript lie), D2 (logic). Tickets are in shuffled order.

## 1. React mechanics: an effect that subscribes and never unsubscribes (COM-702)

**Where:** `App.tsx`:
```ts
useEffect(() => {
  const onKey = (event: KeyboardEvent) => { ... runExport(); };
  window.addEventListener("keydown", onKey);
}, [filters, visible]);
```
**Layer:** rendering lifecycle: effect setup without teardown.

**Why it breaks:** The effect correctly depends on `filters` and `visible` because the handler closes over them (the export needs the current filters and row count). Every time either changes, React runs the effect again and adds another listener, but nothing removes the previous one. Mount adds one; the data loading changes `visible` and adds a second (two exports "right after the page loads"); each filter change adds another. One keypress runs every listener still attached. The button is fine because it calls `runExport` once.

**Fix:** return the teardown:
```ts
window.addEventListener("keydown", onKey);
return () => window.removeEventListener("keydown", onKey);
```
**Looks right but isn't:**
- `[]` as the dependency array: one listener, so one export per press, and the ticket closes. But the handler now closes over the initial `filters` and `visible` forever, so every keyboard export is "all statuses, 0 rows" no matter what's on screen. A silent data bug replaces a loud one. (The acceptance test checks the export log for the current filters for exactly this reason.)
- Guarding with a `listening` ref so the listener is added once: same stale closure, with extra code.
- Storing `filters` in a ref the handler reads: works, and it's a reasonable pattern for subscriptions, but it's a workaround for not cleaning up.

**Fastest way to find it:** `getEventListeners(window)` in Chrome's console shows the count climbing with every filter change. Or React DevTools "Highlight updates" plus a `console.log("subscribe")` in the effect.

**The tell:** an action happening N times where N grows with unrelated interactions. Subscription without cleanup.

**Say it like this:** "The effect subscribes on every run because the handler needs the current filters, but it never unsubscribes, so listeners accumulate. Return a cleanup that removes the listener. Emptying the deps would stop the pile-up but freeze the handler on the first render's filters."

**Production angle:** a `useEventListener` hook that takes the latest handler via a ref, or put the shortcut on the panel element with `onKeyDown` so React owns it.

## 2. TypeScript lie: a cast that lets the wrong literal through (COM-705)

**Where:** `components/FilterBar.tsx`:
```tsx
<select value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value as StatusFilter })}>
  <option value="all">All statuses</option>
  <option value="Paid">Paid</option>
  ...
```
and the comparison in `App.tsx`, `applyFilters`: `row.status === filters.status`.

**Layer:** data entering state through a type assertion. The type `StatusFilter` is `"paid" | "pending" | "void" | "all"`; the DOM delivers `"Paid"`.

**Why it breaks:** `e.target.value` is `string`. The `as StatusFilter` tells the compiler it's one of the four literals, so the state holds `"Paid"` with a type that says `"paid"`. The backend sends lowercase, so `row.status === "Paid"` is false for every row: no rows, zero total. The badges show lowercase because they read `row.status` directly. "All" works because `"all"` happens to be lowercase.

**Fix:** make the option values the literal values, and replace the cast with a check:
```tsx
const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" }, { value: "paid", label: "Paid" }, ...
];
function isStatusFilter(value: string): value is StatusFilter {
  return STATUS_OPTIONS.some((o) => o.value === value);
}
onChange={(e) => { if (isStatusFilter(e.target.value)) onChange({ ...filters, status: e.target.value }); }}
```
**Looks right but isn't:**
- `row.status === filters.status.toLowerCase()` in `applyFilters`: the filter works, and state still holds a value that isn't in its type. The export payload sends `"Paid"` to the server, the select's `value` prop compares against the wrong case, and the next comparison someone writes breaks the same way.
- Lowercasing in the `onChange`: closer, but the cast is still there and the options are still mislabeled; the fix is to stop the lie, not launder the value.
- Changing the server to accept capitalized statuses: the backend's enum is right.

**Fastest way to find it:** React DevTools, select `App`, look at `filters.status` after picking Paid: `"Paid"` with a capital P. The type said that was impossible, so look for an `as`.

**The tell:** a filter that returns nothing for every option except the default, with the data visibly present. Literal mismatch, usually at a cast.

**Say it like this:** "The select's option values don't match the union's literals, and the `as StatusFilter` cast told the compiler they did. The state holds `Paid` while the type says `paid`, so strict equality never matches. Use the literals as option values and validate instead of casting; a type guard makes the DOM boundary honest."

**Production angle:** derive both the options and the union from one `as const` array so they can't drift; never cast DOM values, narrow them.

## 3. Logic: a date-only boundary compared against timestamps (COM-709)

**Where:** `App.tsx`, `applyFilters`:
```ts
const toTs = filters.to ? startOfDay(filters.to) : Infinity;
const travelTs = Date.parse(row.travelDate);
const inRange = travelTs >= fromTs && travelTs <= toTs;
```
**Layer:** plain logic on mixed granularities: a day boundary versus instants.

**Why it breaks:** `startOfDay("2026-10-15")` is midnight at the start of Oct 15. The backend's `travelDate` is a full timestamp with the supplier's check-in time (`2026-10-15T14:30:00Z`). `14:30 <= 00:00` is false, so anything on the last day after midnight is excluded. The first day works because `>= 00:00` includes the whole day. "Set the end date to Oct 16 and she shows up" is the breadcrumb: the boundary is one granularity off, not one day off.

**Fix:** compare at the granularity the filter is defined at, calendar days:
```ts
const travelDay = row.travelDate.slice(0, 10);
const inRange = (!filters.from || travelDay >= filters.from) && (!filters.to || travelDay <= filters.to);
```
ISO date strings compare correctly as strings. (In production you'd convert to the business timezone before slicing.)

**Looks right but isn't:**
- `toTs + 86400000` (add a day): includes the last day, and also includes anything at exactly 00:00:00 on the next day; and it breaks the day DST changes the length of a day in local parsing.
- `travelTs < toTs + 86400000`: same, with the DST issue.
- Changing the label from "inclusive" to "exclusive": the product decided inclusive.
- Normalizing the timestamps to midnight on the server: the backend sends check-in time because other screens need it.

**Fastest way to find it:** log `travelTs` and `toTs` for Fatima's row: `14:30Z` versus `00:00Z` the same day. The row is on the right day and the wrong side of midnight.

**The tell:** inclusive range, first day fine, last day missing, next day fixes it. A date-only bound against a datetime.

**Say it like this:** "The end of the range is midnight at the start of the last day, and the travel dates carry a time of day, so everything on the last day lands after the bound. Compare calendar days to calendar days: slice the date from the timestamp and compare ISO strings. Adding a day to the bound would mostly work and leak the next midnight."

**Production angle:** keep date-only and datetime types distinct (`PlainDate` versus `Instant` in Temporal), and compare in the business timezone.

## Not bugs (in case you went looking)

- `useMemo(() => applyFilters(rows, filters), [rows, filters])`: `filters` is replaced immutably by `FilterBar`, so the memo recomputes exactly when it should.
- The keydown handler ignores events whose target is an input or select, so typing a date doesn't start an export. Deliberate.
- `formatDate(row.travelDate.slice(0, 10))` in the table: slicing the date from the timestamp for display is correct, and it's also the hint for bug 3.
- `Date.parse` on an ISO string with `Z` is well defined in every browser.
- `nextJobId` in `server.ts` is server state.

## Generator QA
- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 05`)
- Surface patch and root fix explained for each: PASS (the `[]`-deps patch is caught by the acceptance test)
- Independent, no accidental extra bugs: PASS (`npm run solution 05`)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: E4, T4, D2: PASS
