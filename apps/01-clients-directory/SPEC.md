# App 01: Clients directory (60 minutes)

**Skill:** async data and list UI. Fetching, debouncing, out-of-order responses, derived state, selection, loading and empty states.

Run `npm run app 1` to load it. Build `App.tsx` and whatever components and `api/client.ts` you want. The backend is `api/server.ts` (readable, not changeable). When done: `npm run accept 1`.

## Spec (from the PM)

> Advisors need one screen to find a client and see who they are. Search should feel instant but not hammer the API. Picking a client shows their details on the right.

## Acceptance behaviors (the acceptance test checks these exactly)

1. On load, fetch `/api/clients` and render a table with one row per client: full name, email, city, a status badge, lifetime value (whole dollars). The header line reads `<N> clients` once loaded (`aria-label="Result count"`).
2. A search input (`aria-label="Search clients"`) filters by name, email, or city via the API after a 300 ms pause. Typing several characters quickly produces one request, not one per keystroke. Results for an older query never overwrite a newer one (the server is slower for larger result sets, on purpose).
3. A status select (`aria-label="Filter by status"`) with options all, active, prospect, inactive, applied immediately via the API.
4. Clicking a column header button labeled `Client` (last name) or `Lifetime value` sorts the table client-side; clicking the same header again flips direction. The active header shows an arrow.
5. Clicking a row (`role="row"`) highlights it (class `selected`) and loads `/api/clients/:id` into a panel (`aria-label="Client panel"`) showing name as an `h2`, phone, notes as a list, and upcoming trips as "Destination, Mon D, YYYY". While loading, the panel shows "Loading client"; with nothing selected, "Select a client".
6. While the list is loading, show "Searching" in the result count line. With zero results, show "No clients match" in place of the table.
7. Errors from the API (a 404 detail) render as text in the panel, not a crash.

## Narrate as you build

Plan in a comment first: components, where state lives, data flow. Static table from a hardcoded array before any fetch. One behavior at a time, verified in the browser. Say why the debounce is in the input component and the race guard is in the effect. Mention what you'd test and where you'd add React Query.

## Time budget

0-5 plan, 5-15 static, 15-35 fetch + search + filter, 35-45 sort + selection + panel, 45-55 states and errors, 55-60 recap.
