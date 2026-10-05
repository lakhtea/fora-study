# Answer key: rep 14 (Group rooms). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 14`, `npm run solution 14`). Classes: L3 (React mechanics), T7 (TypeScript lie), E8 (async failure). Tickets are in shuffled order.

## 1. React mechanics: a child keeps local state across a change of subject (RMB-701)

**Where:** `components/AssignmentForm.tsx` holds `roomId` and `travelerId` in `useState`, seeded from `block.rooms[0]`; `App.tsx` renders `<AssignmentForm block={block} ... />` with no key.

**Layer:** state consistency. The form's state belongs to one block; the instance outlives the switch.

**Why it breaks:** `useState(block.rooms[0]?.id)` seeds once, on mount. When the selected block changes, React keeps the same `AssignmentForm` instance and just passes a new `block` prop, so `roomId` still holds the Loft's id. The preview looks that id up in all rooms and finds the Loft, which isn't in Casa Lima, hence "(not in this block)". The `<select>` has no matching option so the browser shows the first one, which is why the dropdown looks right while the state is wrong. Touching the dropdown writes state and "fixes itself," which is the breadcrumb.

**Fix:** a different block is a different form; remount by identity:
```tsx
<AssignmentForm key={block.id} block={block} ... />
```
**Looks right but isn't:**
- `useEffect(() => setRoomId(block.rooms[0].id), [block.id])`: resets one render late (a flash of the stale preview), and it's state synced from props in an effect.
- Validating in the handler (`if (!block.rooms.some(r => r.id === roomId)) return`): stops the wrong assignment, leaves the stale state and the misleading dropdown.
- Lifting `roomId` into `App` and resetting it in `setSelectedId`'s handler: works; now `App` owns the form's keystrokes.

**Fastest way to find it:** React DevTools, select `AssignmentForm` after switching: `block` prop says Casa Lima, `roomId` hook says 3. Same instance, stale state.

**The tell:** a form that shows the previous subject's choices after you change subject, and touching any field heals it. State seeded from props on mount, no key.

**Say it like this:** "The form seeds its state from the block on mount, and switching blocks reuses the instance, so the state belongs to the old block. Keying the form by block id makes React mount a fresh one. Syncing in an effect would be a render late and hide the design problem."

**Production angle:** key forms by the record they edit; or a form library whose `reset` runs when the subject changes.

## 2. TypeScript lie: two numbers in the wrong order (RMB-705)

**Where:** `components/AssignmentForm.tsx`: `onAssign: (travelerId: number, roomId: number) => void` and `onAssign(travelerId, roomId)`; `App.tsx`: `handleAssign = async (roomId: number, travelerId: number)`.

**Layer:** component contract. Parameter names are documentation to the compiler, not a check.

**Why it breaks:** The child calls `onAssign(travelerId, roomId)`; the parent reads `(roomId, travelerId)`. Both are `number`, so the parent's function is assignable to the child's prop type and nothing complains. Choosing Loft (3) and Tunde (2) sends "assign traveler 3 to room 2": Ada into the Garden room. Maya (1) into the master suite (1) is symmetric, so it works by coincidence, which is the breadcrumb and why it shipped.

**Fix:** make the contract unmistakable: one object parameter with named fields:
```ts
onAssign: (assignment: { roomId: number; travelerId: number }) => void;
onAssign({ roomId, travelerId });
const handleAssign = async ({ roomId, travelerId }: { roomId: number; travelerId: number }) => ...
```
**Looks right but isn't:**
- Swapping the arguments at the call site: correct today, and the next caller of `onAssign` can make the same mistake because the type still allows it.
- Swapping the parameter names in the parent: same.
- Branded types (`RoomId`, `TravelerId`): a real fix, heavier than needed here; mention it as the typed-ids approach.

**Fastest way to find it:** the Network panel (or a log in `assignRoom`): the request is `POST /api/rooms/2/assign` with `travelerId: 3` when you chose room 3 and traveler 2. Then read the two signatures.

**The tell:** an action that works for the "same number" case and lands in the wrong place otherwise. Positional arguments of the same type.

**Say it like this:** "The child passes `(travelerId, roomId)` and the parent reads `(roomId, travelerId)`; both are numbers, so the compiler can't tell them apart. Pass an object with named fields so the contract is enforced by the type, not by the call site."

**Production angle:** object parameters for any function with two arguments of the same type; branded id types where ids from different tables share a range.

## 3. Async failure: no path for a rejected request (RMB-709)

**Where:** `App.tsx`, `handleAssign`:
```ts
setAssigningRoomId(roomId);
const room = await assignRoom(roomId, travelerId);
...
setAssigningRoomId(null);
```
**Layer:** async failure handling.

**Why it breaks:** `assignRoom` throws on a 409 with the server's message, which is right. The handler has no `try`, so the rejection ends the function before `setAssigningRoomId(null)`, the button stays "Assigning" and disabled, and the message goes nowhere but an unhandled-rejection line in the console. The backend's reason is exactly what the user needs to see.

**Fix:** reset in `finally`, surface the message:
```ts
setAssignError(null);
try { ... } catch (err) { setAssignError(err instanceof Error ? err.message : "Assignment failed"); } finally { setAssigningRoomId(null); }
```
and render `assignError` in a `role="alert"` near the form.

**Looks right but isn't:**
- `finally` alone: the button recovers and the user doesn't know why nothing happened.
- Disabling rooms that are already assigned in the dropdown (which the form already does): prevents this one case; the traveler-already-placed case and any other server rule still hang the form.
- Catching in `assignRoom` and returning null: pushes the problem to every caller.

**Fastest way to find it:** the console's unhandled rejection with the server message; DevTools shows `assigningRoomId` stuck at a number.

**The tell:** a pending state that never ends after an action that can fail. Success-only reset.

**Say it like this:** "The request can reject and the handler only resets on success. Reset in `finally`, catch the error into state, show it, and keep the form usable. A thrown error that reaches nobody is the same as a swallowed one."

**Production angle:** a mutation hook with `isPending` and `error`, and the server's validation rules mirrored client-side where cheap.

## Not bugs (in case you went looking)

- The `disabled` on assigned rooms in the dropdown is a convenience; the server is the source of truth, which is why bug 3 can still happen (a stale page, another advisor).
- `unassigned` is derived from the blocks each render, so the Unassigned panel never drifts from the tables.
- `allRooms.find` in the preview is deliberate so the preview can say "not in this block"; that's the hint for bug 1, not a bug.
- `resetServer` exists for the tests.
- Rooms and travelers sharing an id range is realistic (different tables) and is what makes bug 2 silent.

## Generator QA
- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 14`)
- Surface patch and root fix explained for each: PASS
- Independent, no accidental extra bugs: PASS (`npm run solution 14`)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: L3, T7, E8: PASS
