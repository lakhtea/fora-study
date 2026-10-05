# Advisor Portal: Price Drop (rep 15)

Run `npm run rep 15`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 15`, then open KEY.md.

## What the page does (acceptance behaviors)

- Loads the advisor's price alerts (booking, paid rate, current rate in red when lower, last check date, next check date one day later, status and check count) and the summary line with total nightly drops found.
- Watch a booking: type a reference (any case, with or without FORA-, spaces ignored), Look up shows a preview of the booking, Subscribe (button or Enter) creates the alert in place without leaving the page, clears the field, and adds the row. Server rejections (unknown reference, already subscribed) show next to the form.
- Dates come from the backend as `YYYY-MM-DD` strings and display the same for every advisor.

## Layout

- `App.tsx` owns alerts, bookings, and the subscribe action.
- `components/AlertTable.tsx`, `SubscribeForm.tsx` (the form, lookup preview, errors).
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
