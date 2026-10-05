# Answer key: rep 18 (Messages). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 18`, `npm run solution 18`). Classes: E7 (React mechanics), T4 (TypeScript lie), E6 (async ordering). Tickets are in shuffled order.

## 1. React mechanics: an async subscription with no cleanup (MSG-220)

**Where:** `App.tsx`:
```ts
useEffect(() => {
  if (selectedId === null) return;
  subscribeTyping(selectedId, (name, typing) => setTypingFrom(typing ? name : null)).then((unsubscribe) => unsubscribe);
}, [selectedId]);
```
**Layer:** rendering lifecycle with an async resource. The cleanup was "returned" from the wrong function.

**Why it breaks:** `subscribeTyping` returns a promise of an unsubscribe function. Returning `unsubscribe` from the `.then` callback hands it to the promise, not to React: the effect itself returns `undefined`, so React has no cleanup to run. Every thread you open starts a channel that never closes. Daniel's channel keeps calling `setTypingFrom("Daniel Reyes", true)` while Maya's thread is on screen. More threads, more names.

**Fix:** keep the handle in the effect's scope and close it in the cleanup, handling the case where the cleanup runs before the subscription resolves:
```ts
let active = true;
let unsubscribe: (() => void) | undefined;
subscribeTyping(selectedId, (name, typing) => { if (active) setTypingFrom(typing ? name : null); })
  .then((stop) => { if (active) unsubscribe = stop; else stop(); });
return () => { active = false; unsubscribe?.(); setTypingFrom(null); };
```
**Looks right but isn't:**
- `useEffect(async () => { const stop = await subscribeTyping(...); return stop; })`: the same mistake with a different spelling, and React's types reject it (a promise isn't a cleanup).
- `return () => unsubscribe?.()` without the `active` flag: closes channels that resolved before the switch; a channel that resolves after the switch leaks. The 60 ms handshake makes that a real window.
- Filtering by name in the callback (`if (name === thread.clientName)`): hides the indicator and leaves every channel open and ticking.

**Fastest way to find it:** `console.log("subscribe", clientId)` in the effect and `console.log("unsubscribe")` in the cleanup: the second never prints. Or count intervals in the server's `typingTimers` map.

**The tell:** stale events from something you left, growing with each visit. A subscription without a working cleanup, often because the handle arrived asynchronously.

**Say it like this:** "The effect subscribes and returns nothing to React; the unsubscribe was returned to a promise callback. Hold the handle in the effect's closure, return a cleanup that calls it, and guard against the subscription resolving after cleanup. An async handle still needs a synchronous cleanup."

**Production angle:** a `useSubscription(key, subscribe)` hook that encapsulates the active flag and the late-resolve case.

## 2. TypeScript lie: the union's literals don't match the wire (MSG-224)

**Where:** `types.ts`: `MessageStatus = "Sent" | "Delivered" | "Read"`; the backend sends `sent | delivered | read`; `components/MessageList.tsx` narrows on `"Read"` and `"Delivered"`; `App.tsx` creates the optimistic message with `status: "Sent"`.

**Layer:** data at the API boundary. The union was written in Title Case; the API speaks lowercase.

**Why it breaks:** `res.json()` is `any`, so the declared union is never checked. Every real message has a lowercase status, so `status === "Read"` and `status === "Delivered"` are false for all of them, and the fallthrough prints the clock. The optimistic message is `"Sent"` and matches nothing either, then gets replaced by the server's lowercase `"sent"`, which also matches nothing. Nothing on the page can ever show ticks.

**Fix:** make the union match the wire and narrow on those literals:
```ts
export type MessageStatus = "sent" | "delivered" | "read";
if (status === "read") ...; if (status === "delivered") ...;
```
and `status: "sent"` for the optimistic message.

**Looks right but isn't:**
- `status.toLowerCase() === "read"` in `ticks`: works, and the union still lies, so the next comparison (an unread counter, a filter) misses again.
- Mapping statuses to Title Case in `fetchMessages`: consistent, and now the client has two vocabularies for one enum, and the optimistic message's `"Sent"` has to match the mapped one.
- Changing the server to Title Case: the backend's enum is right.

**Fastest way to find it:** DevTools, `messages[0].status` is `"read"` while the type says `"Read"`. Every comparison in `ticks` is against a value that can't occur.

**The tell:** a status display stuck on the default for every item. Literals in the type that the data never produces.

**Say it like this:** "The union says Title Case, the API sends lowercase, and `any` let it through; every comparison fails and everything falls through to 'sending.' Align the union with the wire, including the optimistic message. A runtime schema would have caught the first message."

**Production angle:** generate types from the API schema, or validate with `z.enum` at the boundary.

## 3. Async ordering: the longer thread lands last (MSG-229)

**Where:** `App.tsx`:
```ts
useEffect(() => {
  if (selectedId === null) return;
  setLoading(true);
  fetchMessages(selectedId).then((rows) => { setMessages(rows); setLoading(false); });
}, [selectedId]);
```
**Layer:** async ordering.

**Why it breaks:** Message latency grows with thread length (`80 + rows * 90` ms): Maya's eight messages take about 800 ms, Daniel's two about 260 ms. Click Maya then Daniel: Daniel's response lands first, then Maya's overwrites it. The heading reads from `selectedId`, so it says Daniel; the list holds Maya's rows. Nothing checks whether a response belongs to the current selection.

**Fix:** ignore superseded responses:
```ts
let cancelled = false;
fetchMessages(selectedId).then((rows) => { if (cancelled) return; setMessages(rows); setLoading(false); });
return () => { cancelled = true; };
```
Say it precisely: the request completes; the guard blocks the write when the promise resumes after the selection changed.

**Looks right but isn't:**
- Disabling the thread list while loading: no race, and a long thread locks the UI.
- Storing `{ clientId, rows }` and checking `clientId === selectedId` inside `.then`: the `selectedId` in that closure is the one the request started with, so it always matches.
- Keying the thread panel by `selectedId` to remount: the old promise still resolves and sets state on an unmounted component; React 18 drops it silently, so it works by accident.

**Fastest way to find it:** `console.log(selectedId, rows.length)` in `.then`: two logs, the second for the earlier client. DevTools: `messages` flips from two rows to eight half a second after the click.

**The tell:** wrong only when two actions happen fast, and the big payload wins. Ordering.

**Say it like this:** "Two requests overlap and the slower one is the older one, so it writes last. A per-run cancelled flag set in cleanup and checked when the await resumes stops a superseded request from writing."

**Production angle:** TanStack Query keyed by `["messages", clientId]`, which cancels and caches so switching back is instant.

## Not bugs (in case you went looking)

- The optimistic message has a negative id so it can't collide with server ids, and it's replaced by the saved one. Correct.
- `subscribeTyping` is re-exported through `api/client.ts` so the page never imports the server directly; the real app would import the realtime client there too.
- `loading && messages.length === 0` keeps the previous thread visible while the next loads. Per spec, and a reason bug 3 is visible rather than hidden by a spinner.
- `resetServer` clears intervals between tests; the real backend has no such thing.
- The threads fetch on mount has a cancelled flag already.

## Generator QA
- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 18`)
- Surface patch and root fix explained for each: PASS (the no-flag cleanup patch is discussed; the check test polls for 2.5 s so a leaked channel fails)
- Independent, no accidental extra bugs: PASS (`npm run solution 18`)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: E7, T4, E6: PASS
