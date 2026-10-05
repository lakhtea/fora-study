# Advisor Portal: Messages (rep 18)

Run `npm run rep 18`, open BUGS.md in a second window, start a 30-minute timer, narrate as if screen-sharing. When the timer ends: `npm run check 18`, then open KEY.md.

## What the page does (acceptance behaviors)

- Lists client conversations with the last message and an unread badge. Picking one loads its messages (longer threads take longer) and shows them under that client's name, always.
- Advisor messages show a status: "sending" (clock) until the server confirms, then "delivered" or "read" with ticks. Client messages show the time.
- The composer sends optimistically and replaces the placeholder with the saved message.
- A typing indicator shows "<client> is typing" for the open conversation only; when you switch conversations the previous one's channel is closed.
- The backend sends statuses in lowercase. The typing channel is a subscription that resolves to an unsubscribe function.

## Layout

- `App.tsx` owns threads, selection, messages, the typing indicator, and send.
- `components/ThreadList.tsx`, `MessageList.tsx`, `Composer.tsx`.
- `api/client.ts` is the frontend API layer (including the typing subscription). `api/server.ts` stands in for the backend: readable, not changeable.
