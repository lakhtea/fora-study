# Advisor Portal: Client settings (rep 06)

Run `npm run rep 06`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 06`, then open KEY.md.

## What the page does (acceptance behaviors)

- The left panel lists the advisor's clients; the first is selected on load. Clicking another client loads that client's settings into the form, clean, with "Up to date" in the status.
- The form shows name, phone, currency, three notification preferences, and the household line listing linked travelers. Editing anything shows "Unsaved changes"; Save sends the form, shows "Saving" while in flight, then "Saved at <time>". If the server rejects the save it says why and the form keeps the edits.
- Linked travelers can be unlinked, and travelers from the advisor's directory can be linked. The directory endpoint does not include archived travelers; a client's record can still reference one.
- The backend accepts phone numbers made of digits, spaces, dashes, and a leading plus.

## Layout

- `App.tsx` owns the client list, the traveler directory, selection, and the loaded settings.
- `components/ClientList.tsx`, `SettingsForm.tsx` (form state and save), `TravelerList.tsx`.
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
