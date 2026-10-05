# Advisor Portal: Client share view (rep 10)

Run `npm run rep 10`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 10`, then open KEY.md.

## What the page does (acceptance behaviors)

- The client-facing, read-only itinerary a traveler opens from a share link. A "Preview as" dropdown at the top stands in for the link (Maya's valid link; Chloe's expired link).
- A valid link shows the trip title, who it's for, a day picker, the selected day's items (time, title, a "details" link per item, and a "show all details" checkbox), and the advisor's contact card. Copy link confirms in place.
- Day items load per day from the API; longer days take longer. The list always matches the heading.
- An expired or unknown link shows the backend's message (for example "This link has expired. Ask your advisor for a new one."), not an empty trip.

## Layout

- `App.tsx` owns the token, the share, the selected day, and the unavailable state.
- `components/ShareHeader.tsx`, `DayPicker.tsx`, `DayItems.tsx` (per-day fetch and the details toggles).
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
