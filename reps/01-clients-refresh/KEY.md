# Answer key: rep 1 (Clients page). Do not open until the timer ends.

Three bugs, one per category, independent. Every fix and every "looks right but isn't" below was checked against this code in a scripted Testing Library run (buggy version: all three tickets reproduce; fixed version: all three resolve and the rest of the page is unchanged). Rotation row for REP 1: E1, T3, D3. Tickets are in shuffled order.

## 1. TypeScript: a string id crossing the API boundary (CLI-204)

**Where:** `api/client.ts`, `fetchClientDetail`, line 23: `return res.json();`. The data that triggers it is in the backend, `api/server.ts` line 79, where the detail endpoint serializes `id` as a string (`id: String(client.id)`); the list and trips endpoints send numbers. The symptom surfaces in `components/ClientDetail.tsx` line 52: `tripsByClient.get(detail.id) ?? []`.

**Layer:** data at the API boundary. The frontend's type says `number`; the wire sends a string on one endpoint; nothing in between checks.

**Why it breaks:** `res.json()` is typed `Promise<any>`, and `any` is assignable to anything, so `return res.json()` satisfies `Promise<ClientDetail>` without a complaint. The return annotation is a promise to the compiler, not a check on the data. At runtime `detail.id` is `"101"`. `tripsByClient` is a `Map<number, Trip[]>` built from the trips endpoint, which sends numeric `clientId`. `map.get("101")` never equals the key `101`, so `upcoming` is `[]` for everyone. Every other field in the panel is fine because strings and dates don't depend on the id. The row highlight works because the table compares `client.id === selectedId`, both numbers from the list endpoint, which never went through the string serialization. That is the ticket's breadcrumb: "the row highlights like it should" means the list path is healthy and the detail path is not.

**Fix:** in the frontend API layer, where the data enters the app, so every consumer gets the type the signature promises and the backend stays untouched:
```ts
export async function fetchClientDetail(id: number): Promise<ClientDetail> {
  const res = await requireOk(await apiFetch(`/api/clients/${id}`), "Loading client");
  const raw = (await res.json()) as Omit<ClientDetail, "id"> & { id: string | number };
  return { ...raw, id: Number(raw.id) };
}
```
The stronger version is to treat the response as `unknown` and parse it with a schema (Zod with `z.coerce.number()` on `id`) or a hand-written guard, so the type is earned instead of claimed. Say that out loud even if you write the short version.

**Looks right but isn't:**
- `tripsByClient.get(Number(detail.id))` in the panel: the symptom goes away, but `detail.id` is still a string everywhere else, and the next consumer that compares ids (a "same as selected" check, a notes save keyed by id) breaks the same way. One patch per consumer is how this class of bug multiplies.
- Changing `server.ts` to send a number: that's the backend. In the real app it's another team's service, and real APIs send string ids all the time (Postgres bigints, Stripe-style ids). The frontend has to be robust to it.
- Switching the Map to `Map<string, Trip[]>` keyed by `String(trip.clientId)`: works, but now ids are strings in one structure and numbers everywhere else, with nothing documenting which is which.
- `==` loose equality: hides the type mismatch instead of fixing it, and the lint rule will flag it anyway.

A valid alternative: make ids strings app-wide (`id: string` in `types.ts`, `Map<string, ...>`, `String(trip.clientId)` when building the map). Ids are opaque; many codebases do this on purpose. It's a bigger change than the boundary fix, so in a 10-minute window, normalize at the boundary and mention the alternative.

**Fastest way to find it:** React DevTools, Components tab, select `ClientDetail`, open the `detail` state: `id: "101"` in quotes. Or `console.log(typeof detail.id)`. Or the Network-style check: `apiFetch("/api/clients/101").then(r => r.json()).then(console.log)` in the console.

**The tell:** one lookup fails for everyone while the rest of the record is fine, and the type says it can't fail. Look at the function that turns the response into the typed value: `res.json()`, `JSON.parse`, `any`, `as`, `!`.

**Say it like this:** "The compile-time type says number, but the runtime value is a string because this endpoint serializes ids differently and `res.json()` returns `any`, so the compiler never saw it. The Map lookup uses strict key equality, so it misses. I'll coerce the id in the client function where the data enters the app, leave the backend alone, and in production put a runtime guard there, because TypeScript can't check what the network sends."

**Production angle:** a Zod schema per endpoint in `client.ts` (`z.coerce.number()` for ids), so every response is validated once and the rest of the app trusts the types honestly.

## 2. React mechanics: stale closure in setInterval (CLI-209)

**Where:** `components/RefreshIndicator.tsx`, lines 10 to 16:
```ts
useEffect(() => {
  setSeconds(0);
  const handle = setInterval(() => {
    setSeconds(seconds + 1);
  }, 1000);
  return () => clearInterval(handle);
}, [refreshedAt]);
```

**Layer:** rendering closures. The interval callback captured the `seconds` from the render that created it.

**Why it breaks:** The effect runs when `refreshedAt` changes, and the interval callback closes over the `seconds` value of the render that ran it. On load, clients arrive in under a second, so the rerun happens while `seconds` is still 0: every tick computes `0 + 1` and sets `1`, React sees `1 -> 1` and bails out, and the text freezes at 1s. After a search, the effect reruns in a render where `seconds` is 1. `setSeconds(0)` flashes 0s, but the new callback captured 1, so the next tick sets 2 and freezes there. The next search captures 2 and freezes at 3. That is the ticket's breadcrumb: each refresh adds exactly one, which is the captured value plus one, every time. In dev, StrictMode runs the mount effect twice; both runs capture 0, so nothing changes.

**Fix:** read the latest state through the functional updater instead of the captured variable:
```ts
setSeconds((s) => s + 1);
```

**Looks right but isn't:**
- Adding `seconds` to the dependency array: the counter ticks, but the effect now reruns every second, and the `setSeconds(0)` at the top of the effect resets it on every rerun, so it flickers between 0 and 1. You'd then move the reset into a separate effect, and you've rebuilt a worse version of the one-line fix.
- Storing `seconds` in a ref and writing `ref.current += 1`: the ref updates but nothing re-renders, so the text never changes. Refs don't trigger renders.
- Removing `setSeconds(0)` so the counter "keeps counting": it ticks from wherever it was, but the reset-on-refresh behavior in the spec is gone.

**Fastest way to find it:** React DevTools, Components tab, select `RefreshIndicator`, watch the `seconds` hook: it goes 0, 1, and stops. Then read the interval callback for a state variable used without an updater. The "each search adds one" pattern in the ticket is the closure's captured value showing itself.

**The tell:** a timer or subscription that advances exactly once and freezes is a closure that captured the initial value.

**Say it like this:** "The interval callback closed over the `seconds` from the render that created it, so it sets the same value forever and React bails out. The functional updater reads the latest state instead of the captured one. Adding `seconds` to the deps would also tick, but it recreates the interval every second and fights the reset."

**Production angle:** a tiny `useInterval` hook that keeps the latest callback in a ref, or derive the display from `Date.now() - refreshedAt` on a 1s tick so there's nothing to capture.

## 3. Logic: a spread merges two objects that share a key (CLI-213)

**Where:** `api/client.ts`, `toClient`, lines 12 to 15:
```ts
function toClient(row: ClientRow): Client {
  const { lastBooking, ...summary } = row;
  return { ...summary, ...lastBooking };
}
```
The data that makes it visible is in `api/server.ts`: every client with a booking carries `lastBooking: { bookingId, destination, nights, createdAt }`, where `createdAt` is when the booking was created. The symptom surfaces in `components/ClientTable.tsx` line 71, `formatDate(client.createdAt)`.

**Layer:** data transformation between the API and the component. The server is right, the table is right; the object the table receives was assembled wrong.

**Why it breaks:** The flatten exists so the table can read `destination` and `nights` at the top level for the Last booking column. Object spread is last-writer-wins, and both `summary` and `lastBooking` have a `createdAt`. For Daniel the spread does `{ createdAt: "2022-11-02", ... }` then `{ bookingId: 7688, destination: "Scottsdale", nights: 4, createdAt: "2026-05-28" }`, so the booking's date overwrites the client's. Tom's booking from January 2024 does the same. Prospects have `lastBooking: null`, and spreading `null` adds nothing, so Priya is correct. That explains the ticket's breadcrumb: wrong only for people with a booking. The detail endpoint never goes through `toClient`, so the panel shows the real date. The sort uses the same polluted `createdAt`, which is why Daniel lands among the newest clients. `bookingId` leaks onto every client object too; nothing reads it yet, which is the next bug waiting.

**Fix:** stop merging objects that share keys. Pick the fields the table needs and name them for what they are:
```ts
function toClient(row: ClientRow): Client {
  const { lastBooking, ...summary } = row;
  return {
    ...summary,
    lastBookingDestination: lastBooking?.destination ?? null,
    lastBookingNights: lastBooking?.nights ?? null,
  };
}
```
with `Client` in `types.ts` changed to `lastBookingDestination: string | null; lastBookingNights: number | null;` and the table cell updated to use them. The type now says exactly what the object holds, and a future field on bookings can't collide with anything.

**Looks right but isn't:**
- Swapping the spread order, `{ ...lastBooking, ...summary }`: the dates come back, so the ticket closes. But `bookingId` and the booking's `createdAt` still land on the object (the client's just wins now), the `Client` type still has optional `destination` and `nights` that mean nothing without context, and the first time bookings grow a `status` or `city` field, a client's status or city silently changes. It's a fix that depends on nobody ever adding a field.
- Renaming `createdAt` to `bookedAt` in `server.ts`: that's the backend, and a booking legitimately has a created date. Other consumers of that endpoint would break.
- Patching the table to read `createdAt` from somewhere else: there is nowhere else; the table only has the merged object.
- Formatting fixes: the dates are real dates, just the wrong ones. `formatDate` is fine.

**Fastest way to find it:** React DevTools, Components tab, select `ClientTable`, open `clients` in props and expand Daniel: `createdAt: "2026-05-28"` next to `bookingId: 7688` and `destination: "Scottsdale"`. A client object carrying booking fields means something merged them. Search for `lastBooking` and you land on `toClient`. Or `console.log(clients[1])` in `App`.

**The tell:** a value that is right in one view and wrong in another, wrong only for records that have a related object, and the wrong value is a plausible date from that related object. That's a key collision in a merge, and the question is "where does this object get assembled."

**Say it like this:** "The panel reads the detail endpoint and is right, so the server has the right date. The table reads a flattened object, and the rows that are wrong are exactly the ones with a booking. Object spread is last-writer-wins and both objects have `createdAt`, so the booking's date overwrites the client's. Reordering the spreads would hide it; the real fix is to stop spreading a nested object into its parent and pick the fields explicitly, and let the type say what's there."

**Production angle:** keep wire types (`ClientRow`) and view types (`Client`) separate and map between them with named fields, never with a spread of a nested object. `noUncheckedIndexedAccess` won't catch this, but a lint rule against spreading unions with overlapping keys, or a test that asserts `toClient` output has no `bookingId`, would.

## Not bugs (in case you went looking)

- `e.target.value as ClientStatus | "all"` in `SearchBar.tsx`: a cast, but the select only offers those four values, so it can't be wrong. Compare with `res.json()` in bug 1, which can.
- `fetchClients` and `fetchUpcomingTrips` also `return res.json()` untyped: the same hole, but those endpoints send ids as numbers, so nothing breaks today. Worth mentioning as the place a guard would go; not a bug in this exercise.
- `requireOk` in `client.ts` swallows a non-JSON error body with `.catch(() => null)`: deliberate, so a 500 with an HTML body still throws a readable error.
- The debounce in `SearchBar` is correct: the cleanup clears the previous timer, so one request fires per pause. It depends on `onSearchChange`, which `App` memoizes with `useCallback`, so the effect doesn't rerun every render.
- `fetchUpcomingTrips` has a cancelled flag and runs once; in dev, StrictMode runs it twice and both responses set the same data.
- `sortClients` copies before sorting (`[...clients].sort`), so there's no mutation. `reverse()` runs on the copy.
- `formatDate` builds the date with `new Date(year, month - 1, day)` from the split string, which is local time, so there is no UTC-midnight shift. The dates in bug 3 are wrong values, not shifted values.
- The server's detail route strips `lastBooking` before responding (`const { lastBooking, ...summary } = client`). That's the backend choosing a shape, and it's why the panel never sees booking fields.
- `ClientDetail` keeps showing the previous client while the next one loads (`loading && !detail`): per the spec.

## Generator QA
- Page renders on load with no console errors: PASS (rendered under jsdom with Testing Library; load, the Last booking column, search, status filter, sort, and detail loading all asserted)
- npm run typecheck passes: PASS (strict, buggy and fixed versions)
- Ticket 1, 2, 3 each reproduce by following their steps, every time: PASS (asserted in a test run with TZ=America/New_York: "No upcoming trips" for Maya; counter still 1s after 2.6 seconds; Client since shows May 28, 2026 for Daniel and Jan 15, 2024 for Tom while Priya is correct)
- Each bug has a surface patch and a root fix, and the key explains why the patch is insufficient: PASS
- The three bugs are independent, and there are no accidental extra bugs: PASS (each fix applied and the three correct outcomes asserted in a second test run; the rest of the page asserted unchanged)
- No comment, name, or TODO points at a bug: PASS
- Tickets contain no file names, line numbers, or code vocabulary: PASS
- Not-bugs section has at least three real decoys: PASS (nine)
- src line count is within 300 to 550: PASS (517)
- The three classes match the rotation row for REP 1: PASS (E1, T3, D3)
