# Advisor Portal: New booking (rep 03)

Run `npm run rep 03`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 03`, then open KEY.md.

## What the page does (acceptance behaviors)

- Three steps: Traveler, Rooms and dates, Review. The step strip shows where you are.
- Traveler: name and email, validated when you leave a field and when you click Next; Next is blocked until both are valid.
- Rooms and dates: check-in and check-out, one room by default, Add room adds another, each room has a type (from the property's room types) and a guest count; a comparison table lists the room types in the property's order (by size) with a "cheapest first" toggle.
- The summary panel on the right counts rooms and guests and shows a nightly-rate estimate times nights; taxes are added on review.
- Review: fetches a quote for the dates and rooms (per night, taxes, total), then Confirm creates the booking and shows the reference. The supplier desk prices stays over 14 nights by hand, so the quote endpoint refuses those.

## Layout

- `App.tsx` owns the step, traveler, dates, rooms, and room types.
- `components/TravelerStep.tsx`, `RoomsStep.tsx` (rooms, dates, comparison table), `ReviewStep.tsx` (quote and confirm), `Summary.tsx`.
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
