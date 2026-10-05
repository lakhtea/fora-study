# Answer key: rep 21 (Refund requests). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 21`, `npm run solution 21`). Classes: L1 (React mechanics), T6 (TypeScript lie), E8 (async failure). Tickets are in shuffled order.

## 1. React mechanics: index keys with an uncontrolled textarea (RFD-120)

**Where:** `App.tsx`:
```tsx
{visible.map((request, index) => <RefundRow key={index} ... />)}
```
and `components/RefundRow.tsx`: `<textarea defaultValue={request.note} ... />`.

**Layer:** rendering (reconciliation).

**Why it breaks:** After denying Maya, she leaves the Pending list and Daniel moves to index 0. With index keys, React matches Daniel's card to the DOM that was rendering Maya's. The props re-render (name, amount, badge), but the textarea is uncontrolled: `defaultValue` only applies on mount, so the reused node keeps "Call supplier first." Maya's note did save (the server has it), which is the breadcrumb.

**Fix:** key by identity:
```tsx
<RefundRow key={request.id} ... />
```
**Looks right but isn't:**
- Making the textarea controlled: the box shows the right note, and the cards are still keyed by position, so any other per-card DOM state (focus, scroll, a future animation) follows positions.
- `key={`${index}-${request.client}`}`: unique here, still positional in spirit, breaks on two requests from the same client.
- Remounting the list on every change with a changing `key` on the container: throws away all DOM state every time.

**Fastest way to find it:** React DevTools: after the deny, the card at position 0 is the same instance with new props. Or check what `key` the map uses.

**The tell:** derived fields update but DOM-held state follows the position after a delete. Keys.

**Say it like this:** "The cards are keyed by index, so after a deny React reuses the first card's DOM for a different request. The uncontrolled textarea only reads `defaultValue` on mount, so it keeps the old note. Key by id."

**Production angle:** a lint rule against array-index keys; controlled inputs for editable lists.

## 2. TypeScript lie: a null that stands for "forbidden" (RFD-124)

**Where:** `api/client.ts`:
```ts
if (res.status === 403) return null;
```
in both `decideRefund` and `saveNote`, and `App.tsx`: `updated ?? r` and `if (updated) ...`.

**Layer:** data at the API boundary, with failure encoded as absence.

**Why it breaks:** The backend answers 403 with "This request belongs to another advisor." The client turns that into `null`, discarding the reason. `null` is a legal `RefundRequest | null`, so the compiler is content. The handler then does `updated ?? r`, keeping the old row, and resets the busy flag: a perfect no-op. The same shape in `saveNote` is why Leo's note doesn't stick.

**Fix:** failure is a path, not a value:
```ts
class RefundError extends Error { constructor(message, public readonly status) }
async function post(path, body, what) { ... if (!res.ok) throw new RefundError(payload?.message ?? ..., res.status); return res.json(); }
```
and catch into an `error` state rendered as a `role="alert"`.

**Looks right but isn't:**
- Showing "Couldn't approve" when `updated` is null: better than silence, and the server's reason is gone.
- Hiding Approve on requests that aren't mine (`ownerAdvisorId !== ME`): good UX, and the server rule can change (reassignment, delegation); the client still needs to handle the refusal.
- Pre-checking ownership on the client and skipping the request: same.

**Fastest way to find it:** the Network panel: a 403 with a message that never reaches the page. DevTools: `requests` unchanged after the click, `busyId` back to null.

**The tell:** an action that does nothing with no error. A client function returning null on a status code, and `??` on the result.

**Say it like this:** "The client collapses a 403 into null and the component treats null as 'keep the row,' so a refusal is a silent no-op. Throw with the server's message and render it; forbidden is a state, not an absence."

**Production angle:** a discriminated result or typed errors at the boundary so every caller handles refusal.

## 3. Async failure: a rejection with no path back (RFD-129)

**Where:** `App.tsx`, `handleDecide`:
```ts
setBusyId(id);
const updated = await decideRefund(id, decision);
...
setBusyId(null);
```
**Layer:** async failure handling.

**Why it breaks:** For a request the desk already decided, the backend answers 409 with "Already approved by the supplier desk." `requireOk` throws, the `await` rejects, and the function ends before `setBusyId(null)`, so the card stays on "Working." The local list is stale (it still says pending) and nothing refreshes it.

**Fix:** reset in `finally`, show the reason, and resync on a conflict:
```ts
try { ... } catch (err) { setError(message); if (err instanceof RefundError && err.status === 409) setRequests(await fetchRefunds()); } finally { setBusyId(null); }
```
**Looks right but isn't:**
- `finally` alone: the button recovers, the stale row stays pending, and the user clicks again.
- Catching in `decideRefund` and returning the stale row: pushes the problem to the caller and hides the conflict.
- Polling the list every few seconds: masks this case and adds load; a refresh on 409 is targeted.

**Fastest way to find it:** the console's unhandled rejection with the server's message; DevTools shows `busyId` stuck.

**The tell:** a pending state that never ends after an action that can fail. Success-only reset.

**Say it like this:** "The request can reject and the handler only resets on success. Reset in `finally`, show the server's message, and on a 409 refetch so the list reflects what the desk already did."

**Production angle:** a mutation hook with `isPending` and `error`, and invalidation of the list query on conflict.

## Not bugs (in case you went looking)

- `visible` is derived from `requests` and `filter` each render. Correct.
- The note box is uncontrolled on purpose (save on blur without a keystroke round trip); the lesson of bug 1 is the key, not the control mode. Say you'd consider controlled.
- `DECIDED_ELSEWHERE` in `server.ts` simulates the supplier desk acting outside this page.
- `resetServer` exists for the tests.
- `money(pendingTotal)` sums only pending requests. Per spec.

## Generator QA
- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 21`)
- Surface patch and root fix explained for each: PASS
- Independent, no accidental extra bugs: PASS (`npm run solution 21`)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: L1, T6, E8: PASS
