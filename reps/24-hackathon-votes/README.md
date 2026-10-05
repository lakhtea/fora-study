# Advisor Portal: Hackathon votes (rep 24)

Run `npm run rep 24`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 24`, then open KEY.md.

## What the page does (acceptance behaviors)

- Shows hackathon projects for the selected category with their vote counts. Counts refresh by polling every 1.5 seconds for the open category only; the Polls counter in the header counts requests.
- Each project the advisor hasn't voted for has a Vote button; the one they voted for shows "Your vote." Voting again moves the vote (the previous project's count drops by one).
- Switching category loads that category's projects under its heading; longer categories take longer to load, and the list always matches the heading.
- The backend sends `voteState` as lowercase `open` or `voted`.

## Layout

- `App.tsx` owns the category, the projects, the polling, and the vote action.
- `components/ProjectList.tsx`.
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
