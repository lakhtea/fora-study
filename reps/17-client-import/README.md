# Advisor Portal: Import clients (rep 17)

Run `npm run rep 17`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 17`, then open KEY.md.

## What the page does (acceptance behaviors)

- Loads the advisor's existing clients; the header says how many it will check against.
- Paste a CSV (name, email, city, status), click Parse, and preview the rows: the status from the CSV (blank cells default to prospect), a per-row status dropdown you can change independently, and a check column: "already a client" for emails that exist, "duplicate in paste" for a repeated email within the paste, "new" otherwise.
- Import sends only the new rows with any status edits applied, and reports the count.
- The backend's clients endpoint returns `{ clients, total }`.

## Layout

- `App.tsx` owns the pasted text, parsed rows, the existing clients, status edits, and the import action.
- `components/csv.ts` (parsing), `PreviewTable.tsx`.
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
