# Advisor Portal: Refund requests (rep 21)

Run `npm run rep 21`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 21`, then open KEY.md.

## What the page does (acceptance behaviors)

- Loads refund requests with client, booking, amount, reason, status, and an internal note box (saved when you leave it). The header counts pending requests and their total; the filter shows pending, approved, denied, or all.
- Approve and Deny decide a pending request: the card shows "Working" during the request, then updates and leaves the Pending filter.
- Requests that belong to another advisor can't be decided or annotated; the page says so. A request the supplier desk already decided says so too and the list refreshes.
- Notes always stay with their own request, including after cards above them are decided.

## Layout

- `App.tsx` owns the requests, the filter, the busy state, and the decide and note actions.
- `components/RefundRow.tsx`.
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
