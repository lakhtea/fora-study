# App 02: Itinerary builder with autosave (60 minutes)

**Skill:** state architecture. `useReducer` for a tree of days and items, immutable updates, derived totals, undo, and a debounced autosave that collapses rapid edits and handles version conflicts.

Run `npm run app 2`. Build `App.tsx` plus components and `api/client.ts`. Backend: `api/server.ts` (readable, not changeable). When done: `npm run accept 2`.

## Spec (from the PM)

> Advisors build the trip day by day and expect it to just save. Rapid edits shouldn't spam the server, and if two people edit the same trip the app must not silently overwrite.

## Acceptance behaviors

1. On load, GET `/api/itineraries/7` and render the title as an `h1`, one card per day (a `div.card` whose `h3` reads `Day 1: Nov 3, 2026`), each item with its title in an element carrying `data-testid="item-title"` and its price, and a trip total (`aria-label="Trip total"`, whole dollars). A per-day total appears in each card (`aria-label="Day N total"`).
2. Each day has an "Add item" form: a kind select (`aria-label="Kind for day N"`), a title input (`aria-label="Title for day N"`), a price input (`aria-label="Price for day N"`), and an "Add to day N" button. Adding appends the item with a client-generated id and clears the form.
3. Each item has `Move up`, `Move down`, and `Remove` buttons labeled `<action> <title>`; moving is within the day only and the buttons disable at the ends.
4. An "Undo" button (`aria-label="Undo"`) reverts the last change (add, move, remove); disabled when there's nothing to undo. At least 10 levels.
5. Autosave: any change schedules a PUT to `/api/itineraries/7` after 800 ms of quiet; several quick changes produce one PUT. A status (`aria-label="Save status"`) reads "Unsaved" after a change, "Saving" during the request, "Saved" after success. Send the `version` you loaded and store the version the server returns.
6. If the server answers 409 (someone else saved), show "Someone else edited this trip" in a `role="alert"`, keep the status at "Unsaved", and offer a "Reload" button that fetches the server's version and replaces local state.
7. Keys are ids, never indexes. Reordering must not lose the title inputs' values elsewhere on the page.

## Narrate as you build

State shape first: `{ itinerary, history: Itinerary[], saveStatus }` with a reducer; say why reducer over several useStates. Explain the autosave as "debounce the intent, not the keystrokes," and why you store the server's returned version.

## Time budget

0-5 plan, 5-15 static render from a fetched itinerary, 15-30 reducer with add/remove/move, 30-40 totals and undo, 40-52 autosave with status, 52-58 409 handling, 58-60 recap.
