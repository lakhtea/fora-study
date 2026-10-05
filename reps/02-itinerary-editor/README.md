# Advisor Portal: Itinerary editor (rep 02)

Run `npm run rep 02`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 02`, then open KEY.md.

## What the page does (acceptance behaviors)

- Loads Maya Okafor's "Lisbon long weekend": three days, four items, and the trip total in the header.
- Each day card lists its items with title, price, a note box (saved when you click away), Up and Down buttons to reorder within the day, and Remove.
- The small circle button on a row opens that item in the panel on the right (day, price, supplier id, note).
- The Add panel lists suppliers for the chosen category (Hotels, Activities, Transfers) and a target day. Add puts the supplier on that day and updates both totals.
- Supplier lists come from the mock API with latency that grows with the number of results.

## Layout

- `App.tsx` owns the itinerary state, selection, and the add/remove/move handlers.
- `components/DayList.tsx` renders days and items. `components/ItemPanel.tsx` shows the selected item. `components/AddItemPanel.tsx` owns the category fetch.
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
