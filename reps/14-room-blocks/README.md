# Advisor Portal: Group rooms (rep 14)

Run `npm run rep 14`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 14`, then open KEY.md.

## What the page does (acceptance behaviors)

- Loads the group's room blocks (two houses with rooms) and the travelers. The header counts who still needs a room; the Unassigned panel lists them.
- Picking a block shows its rooms (who's in each) and the assign form: a room dropdown for that block, a traveler dropdown of unassigned travelers, a preview line naming the room, and Assign. Switching blocks resets the form to the new block's first room.
- Assign sends the chosen room and traveler to the server; the table, the counts, and the Unassigned panel update. The button shows "Assigning" only while the request is in flight.
- If the server rejects (room taken, traveler already placed), the reason appears next to the form and Assign is usable again.
- Room ids and traveler ids are both small integers from the same range. That's how the data is.

## Layout

- `App.tsx` owns blocks, travelers, selection, and the assign action.
- `components/BlockList.tsx`, `RoomTable.tsx`, `AssignmentForm.tsx` (local dropdown state).
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
