# Advisor Portal: Supplier deals (rep 11)

Run `npm run rep 11`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 11`, then open KEY.md.

## What the page does (acceptance behaviors)

- Loads the week's supplier deals: supplier, city, category, headline, discount, validity date, perks.
- The featured strip shows the first three deals in the order the supplier team chose, always.
- The category dropdown filters the cards. "Biggest discount first" sorts the cards only; unticking restores the original order.
- Add to tray / Remove from tray maintain the client's tray; the badge in the header and the tray panel always show the same count.
- The backend sends validity as an object with a date and a timezone. The page shows the date.

## Layout

- `App.tsx` owns deals, the filter, the sort toggle, and the tray.
- `components/DealCard.tsx`, `FeaturedStrip.tsx`, `Tray.tsx`.
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
