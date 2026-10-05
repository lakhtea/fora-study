# Answer key: rep 19 (Availability). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 19`, `npm run solution 19`). Classes: F4 (React mechanics), T1 (TypeScript lie), D4 (logic). Tickets are in shuffled order. With this rep every class in the taxonomy has appeared at least once.

## 1. React mechanics: reading the wrong event property (AVL-301)

**Where:** `components/StaySummary.tsx`:
```tsx
<input type="checkbox" checked={flexible} onChange={(e) => onFlexibleChange(e.target.value === "on")} />
```
**Layer:** rendering, specifically the DOM event contract for a controlled checkbox.

**Why it breaks:** A checkbox's `value` is its form value, `"on"` by default, and it never changes when the box is toggled. `e.target.value === "on"` is therefore always true, so the first click sets `flexible` to true and every later click sets it to true again. The input is controlled by `flexible`, so React re-renders it checked no matter what the user did. `checked` is the property that reflects the toggle.

**Fix:**
```tsx
onChange={(e) => onFlexibleChange(e.target.checked)}
```
**Looks right but isn't:**
- Making the input uncontrolled (`defaultChecked`): the box toggles visually, the state stays true, the note and the grid keep showing the flexible days.
- `onFlexibleChange(!flexible)`: works for a single checkbox and drifts if anything else can change `flexible`; the event already carries the truth.
- `e.target.value === "true"` or binding `value={String(flexible)}`: fighting the control.

**Fastest way to find it:** DevTools: `flexible` stays `true` across clicks. `console.log(e.target.value, e.target.checked)` prints `"on" false` on the second click.

**The tell:** a checkbox that only goes one way. The handler read `value` instead of `checked`.

**Say it like this:** "The handler reads `value`, which for a checkbox is the constant form value, not the toggle. `checked` carries the state. A controlled input then renders whatever the state says, which is why it won't untick."

**Production angle:** a typed `useCheckbox` helper or a form library so the property is never chosen by hand.

## 2. TypeScript lie: a non-null assertion across a month change (AVL-305)

**Where:** `components/StaySummary.tsx`:
```ts
const selectedCell = cells.find((cell) => cell.date === checkIn)!;
const total = checkIn ? selectedCell.rate * stayNights : 0;
```
and `App.tsx`'s month select, which changes the month but keeps `checkIn`.

**Layer:** state consistency between two pieces of state (`month` and `checkIn`), hidden by an assertion.

**Why it breaks:** `find` returns `undefined` when the check-in date isn't in the current month's cells. The `!` erases that, so `selectedCell.rate` compiles. After switching to March with a November date selected, `cells` is March, `checkIn` is Nov 3, `find` misses, and `.rate` throws during render. With nothing selected the branch is skipped, which is the breadcrumb.

**Fix:** two parts: handle the miss, and clear the selection where the month changes:
```ts
const selectedCell = cells.find((cell) => cell.date === checkIn) ?? null;
{checkIn && checkOut && selectedCell ? <dl>...</dl> : <p>Pick a check-in day on the grid.</p>}
```
```tsx
onChange={(e) => { setMonth(e.target.value); setCheckIn(null); }}
```
**Looks right but isn't:**
- `?.` on the lookup alone: no crash, and a November check-in stays selected while March is shown; the grid highlights nothing, the summary is blank, and Reserve would send a date from the wrong month.
- Clearing `checkIn` in a `useEffect` on `month`: render runs first with the stale pair and crashes before the effect.
- Filtering cells by `checkIn`'s month: hides the inconsistency.

**Fastest way to find it:** the console: "Cannot read properties of undefined (reading 'rate')" in `StaySummary`. Search for `!` after `find`.

**The tell:** a crash only when two things are true (a selection exists and the data it points at changed). Two states allowed to disagree, and a `!` hid it.

**Say it like this:** "`find` can miss once the month changes, and the assertion told the compiler it couldn't. Handle undefined in the summary, and clear the selection in the same handler that changes the month, because an effect would run after the crashing render."

**Production angle:** derive selection validity from the data, or key the selection by month.

## 3. Logic: subtracting local midnights across a clock change (AVL-309)

**Where:** `components/dates.ts`:
```ts
export function nightsBetween(checkIn, checkOut) {
  const ms = toLocalDate(checkOut).getTime() - toLocalDate(checkIn).getTime();
  return Math.floor(ms / 86400000);
}
```
**Layer:** plain logic on dates: a calendar span computed from instants.

**Why it breaks:** `toLocalDate` builds local midnights. Between Mar 12 and Mar 19, 2027, New York springs forward (Mar 14), so the span is seven days minus one hour: 6.958 days. `Math.floor` makes it 6. November 3 to 10 has no transition and counts correctly; a stay across the fall-back would be seven days plus an hour and floor to 7, so the bug only shows in spring. The ticket's "spans the clock change" is the breadcrumb.

**Fix:** count calendar days, not elapsed time:
```ts
function utcDay(iso) { const [y, m, d] = iso.split("-").map(Number); return Date.UTC(y, m - 1, d) / 86400000; }
export function nightsBetween(a, b) { return utcDay(b) - utcDay(a); }
```
UTC has no DST, so each calendar day is exactly 86,400,000 ms.

**Looks right but isn't:**
- `Math.round` instead of `Math.floor`: correct for a single one-hour transition, and it's correct by luck; the computation is still elapsed time, and a stay long enough to cross two transitions in a zone with a non-hour offset change would still be wrong. Say it works, and say why it's the wrong model.
- Adding an hour before dividing: same category.
- Using `addDays` to walk from check-in to check-out and counting steps: correct, and O(n) for a one-line arithmetic problem.

**Fastest way to find it:** `(new Date(2027, 2, 19) - new Date(2027, 2, 12)) / 86400000` in the console in Eastern time: 6.958.

**The tell:** a day count off by one only for spans that cross a specific date in March or November. Elapsed time across DST.

**Say it like this:** "The night count subtracts local midnights, and the span crosses the spring-forward, so it's an hour short and floors to six. Nights are calendar days; compute them in UTC where days are fixed length, or with calendar arithmetic. Rounding would mask this one and keep the wrong model."

**Production angle:** `Temporal.PlainDate.until` in days; never derive calendar quantities from `getTime()` differences.

## Not bugs (in case you went looking)

- `addDays` uses `setDate`, which handles month ends and DST correctly because it works on calendar fields, not elapsed time. That's the model the night count should have used.
- `availability.month !== month` gating the render keeps the old grid from showing under a new month's heading.
- The grid highlights stay dates from `addDays`, so it's right even while bug 3 shows the wrong count. That's the two-views-disagree foothold.
- `seeded` makes the availability deterministic for the tests.
- `aria-pressed` on the day buttons marks the selected check-in accessibly.

## Generator QA
- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 19`)
- Surface patch and root fix explained for each: PASS
- Independent, no accidental extra bugs: PASS (`npm run solution 19`)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: F4, T1, D4: PASS
