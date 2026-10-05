# Advisor Portal: Commissions (rep 05)

Run `npm run rep 05`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 05`, then open KEY.md.

## What the page does (acceptance behaviors)

- Loads this quarter's bookings with reference, client, supplier, travel date, status badge, and commission; the footer totals the visible rows.
- Status dropdown filters to paid, pending, or void. Travel from/to filters by travel date, inclusive on both ends; either end can be empty.
- Export filtered rows queues a CSV export for the visible rows and logs it in the panel with the row count and the filters used. Pressing E anywhere outside an input does the same thing, once.
- The backend sends travel dates as full timestamps (the supplier's check-in time), and statuses in lowercase.

## Layout

- `App.tsx` owns rows, filters, the export log, the filter function, and the keyboard shortcut.
- `components/FilterBar.tsx`, `CommissionTable.tsx`, `ExportPanel.tsx`.
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
