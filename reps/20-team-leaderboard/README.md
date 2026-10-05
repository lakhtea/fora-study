# Advisor Portal: Team leaderboard (rep 20)

Run `npm run rep 20`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 20`, then open KEY.md.

## What the page does (acceptance behaviors)

- Loads the ranked advisors for the chosen period (month or quarter): rank, name, bookings, revenue, movement versus the previous period. A clock in the header shows how long since the data loaded and ticks every second; the rows don't redraw for the clock.
- "Bottom first" reverses the display order and unticking restores it; the data itself never changes order.
- My rank shows the viewing advisor's position and the gap to the leader, with a "View as" dropdown that includes advisors not yet on the board; those see "Not ranked yet."
- Rows are memoized and expose a render counter in `data-renders`.

## Layout

- `App.tsx` owns the period, rows, advisors, the viewer, and provides the board context.
- `components/BoardContext.tsx`, `Board.tsx`, `BoardRow.tsx` (memoized), `MyRank.tsx`.
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
