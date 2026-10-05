# Advisor Portal: Availability (rep 19)

Run `npm run rep 19`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 19`, then open KEY.md.

## What the page does (acceptance behaviors)

- Loads one hotel's availability for the chosen month: a grid of days with the nightly rate, sold-out days greyed and disabled.
- Click an available day to set check-in. Nights (1 to 7) sets the length; the grid highlights the stay. "Flexible dates" additionally highlights a day either side and the note says so; unticking returns to exact dates.
- The summary shows check-in, check-out, the night count (always the number of calendar nights, whatever the clocks do), the rate, and the total.
- Switching months reloads the grid and clears the selection.

## Layout

- `App.tsx` owns the month, availability, check-in, nights, and flexibility.
- `components/MonthGrid.tsx`, `StaySummary.tsx`, `dates.ts` (date-only helpers).
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
