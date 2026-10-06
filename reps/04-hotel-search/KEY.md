# Answer key: rep 04 (Hotel search). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 04`, `npm run solution 04`). Classes: E2 (React mechanics), T2 (TypeScript lie), D5 (logic). Tickets are in shuffled order.

## 1. React mechanics: effect dependencies don't match what the effect reads (HTL-512)

**Where:** `App.tsx`:

```ts
const filters = { query, city, minStars };
useEffect(() => {
  ...
  searchHotels(filters).then(...)
  ...
}, [query]);
```

**Layer:** rendering, specifically the effect's dependency contract.

**Why it breaks:** The effect reads `city` and `minStars` through `filters` but only lists `query` as a dependency. Changing the city re-renders the component (so the scope label, which is derived from state, updates) but the effect doesn't rerun, so no request fires and the list and count stay as they were. That's the two-views-disagree breadcrumb. Clearing the search box changes `query`, which reruns the effect with the current `filters`, which is why "the city filter suddenly applies."

**Fix:** list what the effect uses, and build the object inside the effect so there's no object to forget:

```ts
useEffect(() => {
  let cancelled = false;
  setLoading(true);
  searchHotels({ query, city, minStars }).then(...);
  return () => { cancelled = true; };
}, [query, city, minStars]);
```

**Looks right but isn't:**

- `[filters]`: `filters` is a new object literal on every render, so the dependency changes on every render, the effect runs on every render, each run calls `setHotels`, which renders, which creates a new object. A request storm. The `cancelled` flag hides most of the visible damage, which makes it worse.
- `useMemo(() => ({ query, city, minStars }), [query, city, minStars])` then `[filters]`: works, but it's the same three dependencies with a detour.
- Calling `searchHotels` directly in the dropdown handlers: fixes the dropdowns, duplicates the fetch logic, and leaves the effect lying about what it depends on.
- Disabling the lint rule: the lint rule was right.

**Fastest way to find it:** React DevTools, select `App`, change the city: `city` state changes, `hotels` doesn't, and "Highlight updates" shows `ResultList` re-rendering with the same data. Then read the effect's dependency array against what it reads.

**The tell:** a derived label updates but the data behind it doesn't, and some unrelated change makes it catch up. That's a stale effect.

**Say it like this:** "The effect reads three values and declares one. React only reruns it when `query` changes, so city and stars never trigger a fetch. I'll depend on the three primitives and build the filters object inside the effect; depending on an object built in render would rerun it every render."

**Production angle:** `react-hooks/exhaustive-deps` as an error, and a data hook (TanStack Query) keyed on the full filter tuple so the dependency list is the cache key.

## 2. TypeScript lie: the response shape isn't the declared shape (HTL-516)

**Where:** `api/client.ts`, `fetchHotelDetail` returns `res.json()` as `Promise<HotelDetail>`, where `amenities: string[]`. The backend (`api/server.ts`, detail route) sends `amenities: [{ code, label }]`. The symptom is in `components/HotelPanel.tsx`: `detail.amenities.join(", ")`.

**Layer:** data at the API boundary. The type was written from a wish, not from the wire.

**Why it breaks:** `res.json()` is `Promise<any>`, so the declared return type is never checked against the data. The supplier feed sends amenities as objects. `Array.prototype.join` stringifies each element with `String(obj)`, which is `"[object Object]"`. The other fields are strings and numbers, so they render fine, which is the ticket's breadcrumb that the data arrived and one field has the wrong shape.

**Fix:** map the wire shape to the app shape in the client function:

```ts
interface HotelDetailWire extends Omit<HotelDetail, "rate" | "amenities"> {
  rate: string | number;
  amenities: { code: string; label: string }[];
}
const raw = (await res.json()) as HotelDetailWire;
return {
  ...raw,
  rate: Number(raw.rate),
  amenities: raw.amenities.map((a) => a.label),
};
```

**Looks right but isn't:**

- `detail.amenities.map((a: any) => a.label).join(", ")` in the panel: the panel works and the type still says `string[]`. The next consumer (an amenities filter, an export) trusts the type and breaks the same way.
- Changing the type to `amenities: { code: string; label: string }[]` and updating the panel: honest, and fine if every consumer wants objects. It moves the mapping to each render site instead of doing it once.
- Changing the server to send strings: the backend's feed shape is what it is.

**Fastest way to find it:** React DevTools, select `HotelPanel`, open `detail` in the hook: `amenities: Array(2)` of objects. Or the console: `[object Object]` means an object met `String()`.

**The tell:** `[object Object]` on screen is always an object where a string was expected, and in a typed codebase it means the type lied at a boundary.

**Say it like this:** "`res.json()` returns any, so the declared `string[]` was never checked, and the feed sends objects. `join` stringifies them to `[object Object]`. I'll map labels at the boundary so the app type is true everywhere; a runtime schema would make that enforced, not hoped."

**Production angle:** a Zod schema per endpoint in `client.ts`, with the wire type and the app type kept separate on purpose.

## 3. Logic: a reduce that concatenates (HTL-519)

**Where:** `components/Shortlist.tsx`:

```ts
const nightly = hotels.reduce((sum, hotel) => sum + hotel.rate, 0);
```

The data behind it: the list endpoint sends `rate: "390.00"` (a decimal string), and `searchHotels` in `api/client.ts` passes it through as if it were the declared `number`.

**Layer:** plain logic on data that crossed a boundary with the wrong type.

**Why it breaks:** `rate` is `"390.00"` at runtime. `0 + "390.00"` is `"0390.00"`, a string. `Number("0390.00")` inside `moneyCents` is 390, so one hotel formats correctly. Add a second: `"0390.00" + "240.00"` is `"0390.00240.00"`, and `Number` of that is `NaN`, so `$NaN`. Each row's `money(hotel.rate)` is fine because `Intl.NumberFormat` coerces a single numeric string. That's the breadcrumb: the parts are right, the sum is wrong, and it only breaks at two.

**Fix:** coerce at the boundary so `rate` is a number everywhere:

```ts
// client.ts, searchHotels
return {
  results: page.results.map((h) => ({ ...h, rate: Number(h.rate) })),
  total: page.total,
};
```

**Looks right but isn't:**

- `sum + Number(hotel.rate)` in the reduce: fixes this total, leaves string rates in state for every other consumer (a sort by price would sort lexically: "1450.00" before "240.00").
- `parseFloat` in the panel and the list rows: patching render sites one by one.
- Changing the server to send numbers: decimal strings are the correct wire format for money; the client has to parse them.
- `reduce(..., "0")`: no.

**Fastest way to find it:** `typeof` in the console, or DevTools showing `rate: "390.00"` in quotes on a hotel in state. The `$NaN` itself says a string reached arithmetic.

**The tell:** sums wrong while parts are right, correct at one item and broken at two, `NaN` or a suspiciously long number. String concatenation in a reduce.

**Say it like this:** "The wire sends money as decimal strings and the client passed them through as numbers, so `+` concatenated and the total became NaN. `Intl` coerced the single values so the rows looked fine. Parse at the boundary; a reduce should never see a string."

**Production angle:** money in integer cents in app state, parsed once; a schema at the boundary.

## Not bugs (in case you went looking)

- `handleQueryChange` is memoized with `useCallback` so `Filters`' debounce effect doesn't rerun every render. Correct.
- The debounce in `Filters` fires `onQueryChange("")` once on mount, which sets `query` to its existing value. No extra render, no extra request.
- `shortlistIds={shortlist.map(...)}` creates a new array each render. `ResultList` isn't memoized, so it costs nothing.
- `e.stopPropagation()` on the shortlist button keeps the row click from also selecting the hotel. Deliberate.
- The server strips description, amenities, and check-in from list results. That's the backend keeping list payloads small.

## Generator QA

- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 04`)
- Surface patch and root fix explained for each: PASS
- Independent, no accidental extra bugs: PASS (`npm run solution 04`, including a no-storm check)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: E2, T2, D5: PASS
