# Advisor Portal: Payouts (rep 08)

Run `npm run rep 08`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 08`, then open KEY.md.

## What the page does (acceptance behaviors)

- Loads the advisor's payout periods (month, bookings, amount, status, reviewed) and the payout settings (default threshold $500, monthly schedule).
- The threshold box sets a custom threshold; the summary next to it reads "Custom: $X" or "Default ($500)"; Reset to default clears the box and returns to the default.
- The Next payout panel adds up pending payouts (held ones are excluded and noted) and says "ready" when the total meets the effective threshold, or "Not yet: $pending of $threshold". It updates the moment the threshold changes. Refresh reloads the rows.
- Pick a payout in the dropdown; the "Selected:" text names it; Mark as reviewed flips that row's Reviewed cell to Yes.

## Layout

- `App.tsx` owns rows, settings, the threshold, and the selection.
- `components/ThresholdSettings.tsx`, `PayoutTable.tsx`, `EstimatePanel.tsx`.
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
