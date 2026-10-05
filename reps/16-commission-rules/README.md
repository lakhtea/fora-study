# Advisor Portal: Commission rules (rep 16)

Run `npm run rep 16`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 16`, then open KEY.md.

## What the page does (acceptance behaviors)

- Loads the commission rules (tier, rate, enabled) and a 2,000-booking sample for the chosen quarter.
- The rule editor lets you type a rate and tick enabled. The preview on the right is heavy (it stands in for 2,000 formatted rows); it should update when a rate is committed (leaving the field), not on every keystroke, and when a rule is toggled.
- The preview shows the sample's total commission on total gross, a warning with the count of bookings that have no matching rule, and the first 12 rows with per-booking commission ("No rule" where none applies; $0 where the rule is disabled).
- Switching the sample quarter refetches and recomputes everything.

## Layout

- `App.tsx` owns rules, the quarter, and the sample.
- `components/RuleEditor.tsx`, `PreviewTable.tsx` (with a render counter in `data-renders`).
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
