# Advisor Portal: Trip costs (rep 22)

Run `npm run rep 22`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 22`, then open KEY.md.

## What the page does (acceptance behaviors)

- Loads a trip's cost lines in the supplier's currency (EUR) and the mid-market EUR to USD rate from the FX endpoint.
- The USD column and the client total convert every line at the client rate (mid-market plus a 0.02 markup) and update the moment the rate changes or fees are toggled.
- The rate box shows the mid-market rate and can be edited; the "client rate" line shows the mid-market rate plus markup as a number.
- The backend sends most lines as `amount` in euros and fee lines as `amountCents`; the FX endpoint sends the rate as a decimal string.

## Layout

- `App.tsx` owns the trip, the rate, the fees toggle, and the conversion.
- `components/CostTable.tsx`, `RatePanel.tsx`.
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
