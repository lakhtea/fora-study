# Advisor Portal: Supplier contacts (rep 23)

Run `npm run rep 23`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 23`, then open KEY.md.

## What the page does (acceptance behaviors)

- Loads a supplier's contacts (name, role, phone, email) and which one is primary.
- Phone and email are editable inline; edits show "Unsaved changes" and are reflected immediately in the primary contact card preview on the right.
- The "primary" radio picks which contact is primary; the preview follows.
- Save contacts sends the edited contacts and the primary choice, shows "Saving" then "Saved at <time>", and clears the edits. Clicking Save records exactly one analytics event; nothing else on the page records events.

## Layout

- `App.tsx` owns the contacts, the edits, the primary choice, and the save action.
- `components/ContactRow.tsx`, `SaveBar.tsx`, `merge.ts` (applies edits to a contact), `analytics.ts` (a small tracker that returns the event it records).
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
