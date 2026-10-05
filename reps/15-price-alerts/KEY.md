# Answer key: rep 15 (Price Drop). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 15`, `npm run solution 15`). Classes: F2 (React mechanics), T3 (TypeScript lie), D4 (logic). Tickets are in shuffled order.

## 1. React mechanics: a form submit that keeps its default (PRD-810)

**Where:** `components/SubscribeForm.tsx`:
```tsx
<form className="panel form" onSubmit={() => submit()} ...>
  ...
  <button type="submit" ...>Subscribe</button>
```
**Layer:** rendering and the browser's default behaviors. React handled the event; the browser also did.

**Why it breaks:** A submit button inside a `<form>` fires `submit`, and the browser's default action is to navigate (a full-page GET of the form's action, which here is the current URL). The React handler runs first and starts the request, then the navigation tears the page down. Whether the subscription exists after the reload depends on whether the POST reached the server before the unload, which is the "sometimes" in the ticket. Look up is `type="button"`, so it never submits, which is the breadcrumb. (In the jsdom test, navigation isn't implemented, so the harness checks that the event was left unprevented.)

**Fix:**
```tsx
onSubmit={(e) => { e.preventDefault(); submit(); }}
```
**Looks right but isn't:**
- `type="button"` on Subscribe with an `onClick`: no reload, and Enter in the field no longer submits, which the acceptance test checks.
- Removing the `<form>` element: same loss of keyboard submission and of the semantics screen readers rely on.
- `action="#"` on the form: a hash navigation instead of a reload; still a navigation, and it leaves a `#` in the URL.

**Fastest way to find it:** the Network panel with "Preserve log": a document request right after the POST. Or the "Not implemented: navigation" line in a jsdom run.

**The tell:** a page that reloads on a button inside a form. Default not prevented.

**Say it like this:** "The submit handler runs but doesn't prevent the browser's default, so the form navigates and the page reloads mid-request. `preventDefault` on the submit event keeps Enter working and stops the reload. Switching the button to `type=button` would stop the reload and break keyboard submission."

**Production angle:** React 19 form actions (`<form action={fn}>`) handle this by design; until then, every `onSubmit` starts with `preventDefault`.

## 2. TypeScript lie: a reference typed as a number (PRD-814)

**Where:** `types.ts`: `Booking.reference: number`; `components/SubscribeForm.tsx`:
```ts
const match = bookings.find((b) => b.reference === Number(reference.trim().replace(/^FORA-/i, "")));
```
**Layer:** data at the API boundary. The wire sends `"FORA-610233"`; the type says `number`.

**Why it breaks:** `res.json()` is `any`, so the declared `number` was never checked. At runtime `b.reference` is `"FORA-610233"`. The lookup strips the prefix from the input and converts to a number, then compares a number to a string with `===`, which is always false. No reference can ever match. Subscribe works because the server does its own lookup with the string, which is the breadcrumb.

**Fix:** tell the truth about the type and compare strings, normalized:
```ts
reference: string;
const normalize = (v: string) => v.trim().toUpperCase();
const match = bookings.find((b) => normalize(b.reference) === normalize(reference));
```
**Looks right but isn't:**
- `String(b.reference) === reference.trim().toUpperCase()`: works, and the type still claims a number; the next consumer sorts references numerically.
- Stripping "FORA-" on both sides and comparing the digits: works for this format, breaks the first time a reference has letters after the prefix, and still lies in the type.
- Changing the server to send numeric ids: references are opaque strings by design.

**Fastest way to find it:** DevTools, open a booking in state: `reference: "FORA-610233"` in quotes. The type said number.

**The tell:** a lookup that can never match, where one side came from a form and the other from an API. Compare the runtime types, not the declared ones.

**Say it like this:** "The wire sends references as strings and the type says number, so the lookup compares a string to a number and never matches. Fix the type, normalize both sides, compare strings. A runtime schema at the boundary would have caught the type the first day."

**Production angle:** schema validation at `fetchBookings`; references typed as a branded string.

## 3. Logic: a date-only string parsed as UTC midnight (PRD-818)

**Where:** `components/AlertTable.tsx`:
```ts
function nextCheck(lastChecked: string): string {
  const date = new Date(lastChecked);
  date.setDate(date.getDate() + 1);
  return date.toLocaleDateString(...);
}
```
**Layer:** plain logic on dates: a calendar date treated as an instant.

**Why it breaks:** `new Date("2026-10-04")` is midnight UTC, which in New York is 8 pm on Oct 3. Adding one local day gives 8 pm on Oct 4, which formats as "Oct 4," the same day as the last check. In London it's midnight on Oct 4 plus a day, "Oct 5," which is the breadcrumb. The Last check column uses `shortDate`, which builds a local date from the parts, so it's right.

**Fix:** build a local date from the parts and add the day there:
```ts
const [y, m, d] = lastChecked.split("-").map(Number);
const date = new Date(y, m - 1, d + 1);
```
(The Date constructor normalizes day overflow, so Oct 31 + 1 becomes Nov 1.)

**Looks right but isn't:**
- Adding two days: right in New York, wrong everywhere east of UTC.
- Formatting with `timeZone: "UTC"`: right for this column, and now any real instant on the page renders wrong.
- `setUTCDate(getUTCDate() + 1)` then local formatting: still an instant at UTC midnight formatted locally, same shift.

**Fastest way to find it:** `new Date("2026-10-04").toString()` in the console shows Oct 3 evening in Eastern time. Two columns on the same row disagree and only one calls `new Date(string)`.

**The tell:** off by one day for some people, right in London. Date-only string through `new Date`.

**Say it like this:** "`new Date` parses a date-only string as UTC midnight, so in New York it's the evening before, and adding a day lands on the same calendar date as the last check. Parse the parts into a local date and add the day there; keep calendar dates and instants apart."

**Production angle:** `Temporal.PlainDate.add({ days: 1 })`; one shared date helper.

## Not bugs (in case you went looking)

- `submit` is `async` and the form handler calls it without awaiting; fine, errors are caught inside `submit`.
- The server normalizes the posted reference (`trim().toUpperCase()`), which is why Subscribe accepts what Look up rejects.
- `Math.max(0, paid - current)` in the savings sum excludes rate increases. Deliberate.
- `shortDate` in the table is the correct date-only parse, and it's the hint for bug 3.
- `resetServer` exists for the tests.

## Generator QA
- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 15`)
- Surface patch and root fix explained for each: PASS (the `type="button"` patch fails the Enter check)
- Independent, no accidental extra bugs: PASS (`npm run solution 15`)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: F2, T3, D4: PASS
