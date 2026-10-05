# Advisor Portal: Trips timeline (rep 07)

Run `npm run rep 07`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 07`, then open KEY.md.

## What the page does (acceptance behaviors)

- Loads all trips, sorted by start date, with destination, client, dates, status badge, and total. The header shows the count and the booked total; a "Requests sent" counter shows how many searches have gone to the API.
- The search box filters by client, destination, or hotel after a 300 ms pause; typing several letters quickly sends one request.
- The status dropdown filters client-side.
- Opening a trip shows a drawer with full dates, hotel, status, and total. Close returns to the empty state.
- Dates on the timeline and in the drawer are the trip's calendar dates, the same for every advisor regardless of timezone. The backend sends dates as `YYYY-MM-DD` strings.

## Layout

- `App.tsx` owns the query, results, the request counter, selection, and the status filter.
- `components/SearchBox.tsx` (debounce), `Timeline.tsx`, `TripDrawer.tsx`.
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
