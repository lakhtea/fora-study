# Advisor Portal: Today (rep 25, the final mock)

Run this one as the full 45-minute mock: 5 minutes of intros with Claude playing a Fora engineer, 30 minutes on the three tickets with narration, 10 minutes of Q&A. `npm run rep 25`, open BUGS.md in a second window, share your screen with yourself (record it), and have Claude grade you on Fora's four criteria: solution completeness and verification, communication, technical knowledge, debugging skills. When the timer ends: `npm run check 25`, then open KEY.md.

## What the page does (acceptance behaviors)

- Greets the advisor and shows today's open tasks (title, client, due time). Opening a task shows its details in the panel below; Done completes it on the server and removes it from the list; completing the open task clears the panel.
- A countdown to the next call counts down every second from the server's figure.
- The client spotlight card shows the client's name and city, their phone and email, and underneath, the spotlighted trip's name, departure date, total, and status.

## Layout

- `App.tsx` owns the dashboard data and the selected task.
- `components/TaskList.tsx`, `TaskPanel.tsx`, `Countdown.tsx`, `SpotlightCard.tsx`.
- `api/client.ts` is the frontend API layer. `api/server.ts` stands in for the backend: readable, not changeable.
