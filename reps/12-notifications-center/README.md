# Advisor Portal: Notifications (rep 12)

Run `npm run rep 12`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 12`, then open KEY.md.

## What the page does (acceptance behaviors)

- Loads notifications (price drops, bookings, messages, payouts), newest first, bold while unread. The header shows the unread count, and "(showing N)" when a filter is active. A "Requests sent" counter shows how many list requests have gone to the API.
- The status dropdown (All, Unread, Read) refetches once per change.
- Mark read updates the row and the count immediately and tells the server.
- The savings panel adds up the price-drop savings and shows the largest one. The backend sends savings as decimal strings.

## Layout

- `App.tsx` owns the filter, the items, the request counter, and the mark-read action.
- `components/FilterBar.tsx`, `NotificationList.tsx`, `SavingsPanel.tsx`.
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
