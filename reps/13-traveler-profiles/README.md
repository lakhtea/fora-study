# Advisor Portal: Travelers (rep 13)

Run `npm run rep 13`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 13`, then open KEY.md.

## What the page does (acceptance behaviors)

- Loads Maya Okafor's household: six travelers with relationship, passport expiry ("N days left", or "No passport on file"), and a "renew" badge when the passport expires less than six months after the trip ends (Nov 10, 2026, so anything before May 10, 2027; exactly six months is fine).
- Clicking a traveler opens the panel: relationship, a show/hide passport line, a notes box with Save (saved to the server), and, for flagged travelers, a renewal notice with an "I've told the client" checkbox.
- Switching between travelers never loses the page. The notes box always shows the selected traveler's notes.
- "Days left" counts from today, which the demo pins to Oct 5, 2026.

## Layout

- `App.tsx` owns the household, selection, per-traveler note drafts, and saving.
- `components/TravelerList.tsx`, `TravelerPanel.tsx`, `passports.ts` (the six-month rule and the day count).
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
