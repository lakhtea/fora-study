# Advisor Portal: Supplier onboarding (rep 09)

Run `npm run rep 09`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 09`, then open KEY.md.

## What the page does (acceptance behaviors)

- Loads one supplier's onboarding record (name, type, contact, uploaded documents) and the document requirements per supplier type.
- The checklist lists the documents required for the current type, with the uploaded file (or "Not uploaded") and a "received" checkbox. Rows are heavy on purpose (they simulate rendering previews) and should only re-render when their own document changes.
- The completion ring shows received over required for the current type and updates the moment the type changes or a box is ticked.
- Document review lists the required documents; picking one shows its file, upload date, and status. A required document that was never uploaded is shown as missing, not as a blank or a crash.
- Submit for approval is enabled only at 100%.

## Layout

- `App.tsx` owns the record, the requirements, and the review selection.
- `components/ChecklistRow.tsx` (memoized, with a render counter in `data-renders`), `CompletionRing.tsx`, `ReviewPanel.tsx`.
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
