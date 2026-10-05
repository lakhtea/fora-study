# Advisor Portal: Clients page (practice rep 1)

A single page from a travel-advisor portal. Run it with `npm run rep 01` from the repo root, open BUGS.md in another window, start a 30-minute timer, and narrate as if you were screen-sharing. When the timer ends: `npm run check 01` tells you whether your fixes pass, then open KEY.md.

## What the page does (acceptance behaviors)

- The page loads the advisor's clients and shows them in a table with name, email, city, status, the date they became a client, their most recent booking (destination and nights, or "None yet"), and lifetime value.
- The header shows how many clients are currently shown and a "Last refreshed Ns ago" counter that counts up each second from the moment the list was last loaded, and resets to 0 whenever the list reloads.
- Typing in Search filters the list by name, email, or city after a short pause (typing does not fire a request per keystroke).
- The status dropdown filters the list to active, prospect, or inactive clients, or shows all.
- Clicking a column header sorts by that column; clicking it again flips the direction. An arrow marks the active sort.
- Clicking a row highlights it and loads that client's details in the panel on the right: contact info, client-since date, last trip, preferences, upcoming trips, and notes.
- The detail panel shows "Loading client" while fetching and keeps showing the previous client until the new one arrives.
- Upcoming trips come from a separate endpoint and are matched to the selected client.

## Layout

- `App.tsx` owns search, filter, sort, and selection state and loads data through `api/client.ts`.
- `components/SearchBar.tsx`, `ClientTable.tsx`, `ClientDetail.tsx`, `RefreshIndicator.tsx` are presentational except where they need their own local state.
- `api/client.ts` is the frontend API layer: the typed functions the components call. This is our code.
- `api/server.ts` stands in for the backend: fixtures and an `apiFetch(url)` that routes a path to a `Response` after 150 to 600 ms. Treat it as the real service: you can read it to understand what it sends, but you can't change it. There is no network.

# Open tickets

**CLI-204. Upcoming trips never show for anyone**
Reported by: Jen (PM), priority: urgent
> I opened Maya Okafor to check her Lisbon dates for November and the panel says "No upcoming trips." Same for Daniel Reyes, who has Scottsdale in three weeks, and Hiro Tanaka. The rest of the panel is right (phone, notes, the client-since date), and the row highlights in the table like it should. I looked at the trips list we export for the newsletter and the trips are definitely in the system.

**CLI-209. The "Last refreshed" counter is frozen**
Reported by: Marcus (advisor), priority: medium
> The little "Last refreshed 1s ago" text in the top right never moves. I left the page open through a whole phone call and it still said 1s. When I type a search, it flips to 0s for a moment, then shows 2s and sticks there. Search again and it sticks at 3s. It's small, but it makes me think the list isn't live.

**CLI-213. "Client since" is wrong for anyone who has booked with us**
Reported by: Jen (PM), priority: high
> Daniel Reyes has been a client since 2022 and the table says May 28, 2026. Tom Lindqvist shows January 2024. Our brand-new prospects like Priya Natarajan show the right date, which makes me think it's only people with a booking on file. When I click Daniel, the panel on the right says November 2, 2022, so the real date is in there somewhere. Sorting by Client since puts Daniel near the top with the newest people, which is how I noticed.
