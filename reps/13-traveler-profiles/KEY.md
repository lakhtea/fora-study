# Answer key: rep 13 (Travelers). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 13`, `npm run solution 13`). Classes: R7 (React mechanics), T5 (TypeScript lie), D2 (logic). Tickets are in shuffled order.

## 1. React mechanics: a hook inside a condition (TRV-610)

**Where:** `components/TravelerPanel.tsx`:
```ts
const [showPassport, setShowPassport] = useState(false);
const flagged = ...;
if (flagged) {
  const [acknowledged, setAcknowledged] = useState(false);
  ...
```
**Layer:** rendering, specifically the rules of hooks.

**Why it breaks:** React identifies hooks by call order, not by name. Rendering Maya calls one hook; rendering Yuki (flagged) calls two. The same component instance switching from one to two hooks is "Rendered more hooks than during the previous render," which React throws, and the tree unmounts. Going the other way would be "fewer hooks." The hook only has to be conditional once for every render path to be suspect, and the error names it: the breadcrumb.

**Fix:** call the hook unconditionally and make the rendering conditional:
```ts
const [acknowledgedIds, setAcknowledgedIds] = useState<number[]>([]);
const acknowledged = acknowledgedIds.includes(traveler.id);
...
{flagged && <div className="danger" role="alert">... checkbox bound to acknowledged ...</div>}
```
Keying the acknowledgement by traveler id also makes it survive switching, which the single boolean wouldn't.

**Looks right but isn't:**
- `<TravelerPanel key={traveler.id} />` in `App`: each traveler gets its own instance, each instance has a consistent hook count, and the crash goes away. The rules-of-hooks violation is still there: if a traveler's passport is edited while their panel is mounted, the hook count changes within one instance and it crashes again. The lint rule still fails.
- Moving the `useState` into a child component rendered only when flagged: a legitimate pattern, since the child's hooks are its own. It loses the acknowledgement when the warning unmounts, which may or may not be what you want; say so.
- Wrapping in a try/catch or an error boundary: contains the symptom.

**Fastest way to find it:** the console error names it. `react-hooks/rules-of-hooks` flags the line in the editor.

**The tell:** a crash that depends on which item you came from and which you went to, mentioning hooks. A hook after an early return or inside an `if`.

**Say it like this:** "The acknowledgement state is created inside `if (flagged)`, so flagged and unflagged travelers call a different number of hooks on the same instance, and React matches hooks by order. Call it unconditionally and render conditionally. Keying the panel would hide it without fixing it."

**Production angle:** `rules-of-hooks` as an error; small child components for conditional UI that needs its own state.

## 2. TypeScript lie: an index signature that promises every traveler has an expiry (TRV-614)

**Where:** `types.ts`: `export type ExpiryById = Record<number, string>;` built in `App.tsx` from travelers who have a passport, and read in `components/TravelerList.tsx`: `daysUntil(expiryById[traveler.id])`.

**Layer:** data consistency between a lookup table and the list it's read against, hidden by a type.

**Why it breaks:** `Record<number, string>` types every index as `string`, so `daysUntil(expiryById[906])` compiles. Noah has no passport, so the map has no entry; the value is `undefined`; `Date.parse(undefined)` is `NaN`; the row prints "NaN days left." Everyone else is right, which is the breadcrumb.

**Fix:** let the type admit the miss and render it as information:
```ts
export type ExpiryById = Partial<Record<number, string>>;
{expiryById[traveler.id] !== undefined ? `${daysUntil(expiryById[traveler.id] as string)} days left` : "No passport on file"}
```
**Looks right but isn't:**
- `daysUntil(expiryById[traveler.id] ?? "")`: still `NaN`; an empty string is not a date.
- `isNaN(days) ? "" : ...`: hides the row's status instead of stating it.
- Reading `traveler.passportExpiry` directly and deleting the map: valid here, and the map exists because other screens need it; the lesson is the type.

**Fastest way to find it:** DevTools shows five keys in `expiryById` and six travelers. `NaN` on screen means a non-number met arithmetic.

**The tell:** `NaN` for one row and numbers for the rest, with a lookup built from a filtered subset. The index signature promised what the filter removed.

**Say it like this:** "The map is built only from travelers with passports but typed as if every id resolves. Noah's lookup is undefined at runtime, and `Date.parse` turns that into NaN. Make the type `Partial`, handle the miss, and say 'No passport on file.'"

**Production angle:** `noUncheckedIndexedAccess`, or a `Map` with `.get()`.

## 3. Logic: counting months by calendar month (TRV-618)

**Where:** `components/passports.ts`:
```ts
export function monthsBetween(fromIso, toIso) { ... return (y2 - y1) * 12 + (m2 - m1); }
export function needsRenewal(tripEnd, expiry) { return monthsBetween(tripEnd, expiry) < 6; }
```
**Layer:** plain logic: a granularity mismatch. The rule is about dates; the code counts month numbers.

**Why it breaks:** `monthsBetween("2026-11-10", "2027-05-01")` is `(2027 - 2026) * 12 + (5 - 11) = 6`, because the days of the month are ignored. May 1 is 5 months and 3 weeks after Nov 10, but it scores 6, so it passes. Every expiry anywhere in May scores 6: May 1 and May 10 are treated alike, which is the breadcrumb ("anything in May gets a pass"). Yuki's February scores 3 and is flagged.

**Fix:** compare dates to a date:
```ts
export function sixMonthsAfter(iso) { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1 + 6, d)).toISOString().slice(0, 10); }
export function needsRenewal(tripEnd, expiry) { return expiry < sixMonthsAfter(tripEnd); }
```
May 1 < May 10 flags; May 10 does not; June 15 does not.

**Looks right but isn't:**
- `monthsBetween(...) <= 6`: Ada is flagged, and so is Sofia (May 10, exactly six months, which the rule allows), and so is everyone expiring in May regardless of day. The acceptance test checks Sofia for exactly this.
- Counting days (`< 183`): close, and six months is not a fixed number of days; the rule is calendar months.
- Subtracting with `new Date(expiry) - new Date(tripEnd)` in milliseconds: the same day-count problem plus a timezone shift (see rep 07).

**Fastest way to find it:** `monthsBetween("2026-11-10", "2027-05-01")` in the console returns 6. The function never looks at the day.

**The tell:** a threshold rule that's right for far values and wrong near the boundary, with the wrongness lining up with a calendar unit. The comparison is happening at the wrong granularity.

**Say it like this:** "The check counts whole calendar months and ignores the day, so May 1 and May 10 both score six. Compute the cutoff date, six months after the trip end, and compare dates. `<= 6` would flag Sofia, who's exactly at six months and allowed."

**Production angle:** `Temporal.PlainDate.add({ months: 6 })` and `compare`; a unit test at the boundary on both sides.

## Not bugs (in case you went looking)

- `DEMO_TODAY` pins "today" so day counts are stable in the demo. The real page uses the current date.
- Notes drafts live in `App` keyed by traveler id, so switching travelers keeps each draft and the textarea is always controlled by the right one. That's why there's no stale-form bug here.
- `handleSave` replaces the traveler with the server's response, so the list and panel agree after a save.
- `PanelBody` is a plain function component rendered twice in the buggy file; that's fine, its hooks are its own (it has none).
- `Date.UTC(y, m - 1 + 6, d)` in the fix rolls the year over correctly when the month passes December.

## Generator QA
- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 13`)
- Surface patch and root fix explained for each: PASS (the `<= 6` patch fails the Sofia check)
- Independent, no accidental extra bugs: PASS (`npm run solution 13`)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: R7, T5, D2: PASS
