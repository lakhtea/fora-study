# Answer key: rep 12 (Notifications). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 12`, `npm run solution 12`). Classes: E3 (React mechanics), T4 (TypeScript lie), D5 (logic). Tickets are in shuffled order.

## 1. React mechanics: an effect that depends on the state it sets (NTF-510)

**Where:** `App.tsx`:
```ts
const [summary, setSummary] = useState({ unread: 0, shown: 0 });
useEffect(() => {
  ...fetchNotifications(filter).then((rows) => {
    ...
    if (filter !== "all") setSummary({ unread: ..., shown: rows.length });
  });
  ...
}, [filter, summary]);
```
**Layer:** rendering lifecycle: an effect whose dependency it writes to.

**Why it breaks:** `summary` is in the dependency array and the effect sets `summary` to a new object when a filter is active. A new object is never equal to the old one, so every response changes the dependency, which reruns the effect, which fetches, which sets another new object. With "All" selected the `if` skips the setter, so the loop never starts, which is the breadcrumb. The `cancelled` flag keeps stale responses from writing, which is why "nothing on the page changes" while it spins.

**Fix:** `summary` is derived from `items`; don't store it and don't depend on it:
```ts
}, [filter]);
...
{filter !== "all" ? ` (showing ${items.length})` : ""}
```
**Looks right but isn't:**
- Removing `summary` from the deps and keeping the state: the loop stops, the lint rule complains, and you've kept a second copy of data you already have.
- Comparing with `JSON.stringify` before setting: stops the loop by making the setter a no-op when values match; still derived state in an effect.
- Setting `summary` only when `shown` differs: same, with more code.

**Fastest way to find it:** the "Requests sent" counter, or the Network panel. In DevTools, `summary` gets a new object every tick. The effect's deps include something the effect writes.

**The tell:** a request loop that starts after one specific action and stops when it's undone. An effect that writes one of its own dependencies with a fresh object or array.

**Say it like this:** "The effect depends on `summary` and sets `summary` to a new object, so each response triggers the next fetch. The summary is derivable from the items, so I'll delete the state and the dependency. An effect must never write a dependency with a fresh reference."

**Production angle:** derive, don't sync; a data library that owns fetching so effects don't.

## 2. TypeScript lie: option values that don't match the union (NTF-514)

**Where:** `components/FilterBar.tsx`:
```tsx
<select value={filter} onChange={(e) => onChange(e.target.value as StatusFilter)}>
  <option value="all">All</option>
  <option value="Unread">Unread</option>
  <option value="Read">Read</option>
```
**Layer:** data entering state through a cast. `StatusFilter` is `"unread" | "read" | "all"`; the DOM delivers `"Unread"`.

**Why it breaks:** The cast tells the compiler the string is one of the literals. State becomes `"Unread"`, the client sends `?status=Unread`, the backend compares against lowercase and returns nothing. "All" works because `"all"` is lowercase. The dropdown shows the right word because its `value` is the same string.

**Fix:** make the option values the literals and validate instead of casting:
```ts
const OPTIONS: { value: StatusFilter; label: string }[] = [{ value: "all", label: "All" }, { value: "unread", label: "Unread" }, { value: "read", label: "Read" }];
function isStatusFilter(v: string): v is StatusFilter { return OPTIONS.some((o) => o.value === v); }
onChange={(e) => { if (isStatusFilter(e.target.value)) onChange(e.target.value); }}
```
**Looks right but isn't:**
- `status.toLowerCase()` in `fetchNotifications`: the fetch works and state still holds a value that isn't in its type; the next comparison (`filter === "unread"` for a highlight) breaks the same way.
- Lowercasing in `onChange` and keeping the cast: launders the value; the cast is still a lie waiting for the next option someone adds.
- Changing the server to accept capitalized values: the backend's enum is right.

**Fastest way to find it:** DevTools, `filter` is `"Unread"` with a capital U while the type says it can't be. Search for `as StatusFilter`.

**The tell:** a filter that returns nothing for every option except the default. Literal mismatch at a cast.

**Say it like this:** "The option values are capitalized labels, the union is lowercase, and the cast hid the difference. Use the literals as values and narrow with a type guard; never cast DOM values."

**Production angle:** derive options and the union from one `as const` array so they can't drift.

## 3. Logic: a reduce that concatenates decimal strings (NTF-519)

**Where:** `components/SavingsPanel.tsx`:
```ts
const total = drops.reduce((sum, item) => sum + (item.savings ?? 0), 0);
```
The data: the backend sends `savings: "120.00"`, a decimal string, and `fetchNotifications` passes it through as the declared `number | null`.

**Layer:** plain logic on data that crossed a boundary with the wrong type.

**Why it breaks:** `0 + "120.00"` is `"0120.00"`; `+ "45.50"` makes `"0120.0045.50"`; `Number` of that is `NaN`, so `moneyCents` prints `$NaN`. "Largest" is right because it goes through `Number(...)` per item before `Math.max`, which is the breadcrumb.

**Fix:** coerce once at the boundary:
```ts
function toNotification(row: NotificationWire): Notification {
  return { ...row, savings: row.savings === null ? null : Number(row.savings) };
}
```
**Looks right but isn't:**
- `sum + Number(item.savings ?? 0)` in the reduce: fixes the total, leaves strings in state for every other consumer.
- `parseFloat` at the render site: same.
- Asking the backend for numbers: decimal strings are the right wire format for money.

**Fastest way to find it:** DevTools, `savings: "120.00"` in quotes on a price-drop item. `$NaN` means a string reached arithmetic.

**The tell:** right per item, wrong in the sum, NaN. String concatenation in a reduce.

**Say it like this:** "The wire sends money as decimal strings and the client passed them through as numbers, so `+` concatenated. Parse at the boundary, once."

**Production angle:** money as integer cents in app state; a schema at the boundary.

## Not bugs (in case you went looking)

- `markRead(id)` is fire-and-forget; the row updates optimistically. Acceptable here; in production you'd handle the failure.
- The `unread` count in the header is derived from `items`, which is why it's right while bug 2 empties the list.
- `resetServer` in `server.ts` exists for the tests; the real backend has no such thing.
- The effect's `cancelled` flag is correct and is what hides bug 1's churn from the UI.
- `TYPE_LABEL` as a `Record<NotificationType, string>` is exhaustive by type.

## Generator QA
- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 12`)
- Surface patch and root fix explained for each: PASS
- Independent, no accidental extra bugs: PASS (`npm run solution 12`)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: E3, T4, D5: PASS
