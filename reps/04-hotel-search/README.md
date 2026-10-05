# Advisor Portal: Hotel search (rep 04)

Run `npm run rep 04`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 04`, then open KEY.md.

## What the page does (acceptance behaviors)

- Loads all hotels on open; the line under the heading shows the count and the active scope ("14 hotels (all cities, any rating)").
- Typing in the search box filters by hotel name or neighborhood after a short pause. The city and minimum-stars dropdowns filter immediately. Every filter change refetches and updates both the list and the count.
- Clicking a row highlights it and loads the hotel's details in the panel: description, rate, check-in time, amenities as a comma-separated list of names.
- Shortlist adds a hotel to the client's shortlist panel; Drop removes it. The panel shows each hotel's rate and a combined nightly total.
- The backend sends money as decimal strings and amenities as code/label objects. That is how the real supplier feed looks.

## Layout

- `App.tsx` owns filters, results, selection, and the shortlist.
- `components/Filters.tsx` (debounced search box and dropdowns), `ResultList.tsx`, `HotelPanel.tsx`, `Shortlist.tsx`.
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
