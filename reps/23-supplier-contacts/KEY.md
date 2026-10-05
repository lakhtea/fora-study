# Answer key: rep 23 (Supplier contacts). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 23`, `npm run solution 23`). Classes: R5 (React mechanics), T7 (TypeScript lie), D3 (logic). Tickets are in shuffled order.

## 1. React mechanics: a handler invoked at render (SCT-301)

**Where:** `components/SaveBar.tsx`:
```tsx
<button ... onClick={trackClick("contacts_saved")}>
```
and `components/analytics.ts`: `trackClick(name: string): any` returns the event it records.

**Layer:** rendering: the prop received the result of a call instead of a function.

**Why it breaks:** `trackClick("contacts_saved")` runs while `SaveBar` renders, so every render records an event; `SaveBar` re-renders whenever `App` does, which is every keystroke, hence the climbing counter. The call returns an object, so `onClick` receives an object; React warns ("Expected `onClick` listener to be a function") and does nothing on click. `onSave` is never called. The `any` return type is why the compiler allowed an object where a handler belongs; with a real return type it would have been an error.

**Fix:** pass a function, and call both things inside it:
```tsx
onClick={() => { trackClick("contacts_saved"); onSave(); }}
```
and give `trackClick` a real return type so the next misuse fails to compile.

**Looks right but isn't:**
- `onClick={() => trackClick("contacts_saved")}`: the counter stops climbing and the click still doesn't save; `onSave` is still unwired. The acceptance test checks that Save persists.
- `onClick={onSave}` alone: saves, drops the tracking the product asked for.
- Changing `trackClick` to return a function that saves: a tracker that performs business logic.

**Fastest way to find it:** the console warning names the prop and the type. The counter climbing while typing says a side effect runs during render.

**The tell:** a side effect that fires on every render plus a button that does nothing. `onClick={fn()}` with a loosely typed `fn`.

**Say it like this:** "The button's onClick is the result of calling the tracker, not a function: the event fires on every render and the click gets an object. Wrap both calls in an arrow. The `any` return type let it compile; typing it would have caught it."

**Production angle:** no `any` returns in shared helpers; a lint rule that flags `onClick={expr()}` where `expr` isn't a known factory.

## 2. TypeScript lie: a prop name mismatch hidden by a wide props type (SCT-305)

**Where:** `components/ContactRow.tsx`: `interface ContactRowProps extends HTMLAttributes<HTMLDivElement> { ... onSelected?: (id: number) => void; }` with the radio calling `onSelected?.(contact.id)`; `App.tsx` passes `onChange={() => setPrimaryId(contact.id)}`.

**Layer:** component contract. The props type accepts far more than the component uses.

**Why it breaks:** Extending `HTMLAttributes<HTMLDivElement>` means the props type includes `onChange` (a form event handler). The parent's `onChange` compiles, lands in the props, and is never read, because the row doesn't spread extra attributes anywhere. The radio calls `onSelected`, which nobody passed, and the optional chaining makes that a silent no-op. The radio is controlled by `isPrimary`, so it stays where it was.

**Fix:** a narrow props type with the callback required, and the parent using its name:
```ts
interface ContactRowProps { contact; phone; email; isPrimary; onSelected: (id: number) => void; onEdit: ...; }
<ContactRow onSelected={setPrimaryId} ... />
```
**Looks right but isn't:**
- Spreading `...rest` onto the root `div`: the parent's `onChange` would fire when the radio's change event bubbles, so it works by accident, with a handler attached to a `div`.
- Keeping `extends HTMLAttributes` and renaming the parent's prop: works until the next caller passes the wrong name; the type still accepts it.
- Removing the `?` on `onSelected` only: now the compiler demands `onSelected`, which is the point; do that and drop the HTML attributes.

**Fastest way to find it:** DevTools, select `ContactRow`: props show `onChange` set and `onSelected` absent. The radio's handler reads the absent one.

**The tell:** a control that does nothing with no error, where the component's props type is "anything a div accepts." Optional callback plus a wide props type.

**Say it like this:** "The row's props extend every div attribute, so the parent's `onChange` type-checks and is ignored; the radio reads `onSelected`, which is optional and not passed. Narrow the props, make the callback required, and use its name in the parent."

**Production angle:** only extend HTML attributes when the component forwards them; required callbacks by default.

## 3. Logic: the original spread over the edits (SCT-309)

**Where:** `components/merge.ts`:
```ts
return { ...edits[contact.id], ...contact };
```
**Layer:** data transformation: a merge with the wrong winner.

**Why it breaks:** Spread is last-writer-wins. The original contact comes last, so any field the user edited is overwritten by the stored value. The preview merges the primary contact with the edits and therefore shows the old phone; the input shows the new one because it reads `edits` directly. Once bug 1 is fixed, Save uses the same helper and would send the originals, reverting every edit.

**Fix:** apply the edits explicitly, field by field:
```ts
const edit = edits[contact.id];
return { ...contact, phone: edit?.phone ?? contact.phone, email: edit?.email ?? contact.email };
```
**Looks right but isn't:**
- Swapping the spreads: works for this page, and a future `edits` entry carrying an unexpected key (an `id` from a stale form, a `name`) would overwrite the record silently. Explicit fields can't.
- Reading `edits` in the preview directly: fixes the preview, leaves Save sending originals.
- Merging on the server: the server shouldn't guess which side wins.

**Fastest way to find it:** `mergeContact(contact, edits)` in the console with an edit present returns the original phone. The input and the preview disagree and only one goes through the merge.

**The tell:** edits visible in the control and absent everywhere else. A merge with the original last.

**Say it like this:** "The merge spreads the original after the edits, so the original wins and edits vanish in the preview and on save. Apply the editable fields explicitly over the original. Reordering the spreads works today and leaks any extra key tomorrow."

**Production angle:** a typed `applyEdits` that only knows the editable fields; never spread user-provided objects over records.

## Not bugs (in case you went looking)

- `events` in `analytics.ts` is a module-level array on purpose; the counter in the save bar reads its length on render. Once bug 1 is fixed it only grows on Save.
- `dirty` compares the edits and the primary choice; it doesn't need the merge.
- `primaryId` lives in `App` and `data.primaryId` is the saved value; the two agree after Save.
- `resetServer` exists for the tests.
- The radio inputs share `name="primary"` so the browser enforces one selection; the state still controls them.

## Generator QA
- Page renders on load with no console errors: PASS (React's listener warning appears on the first render of the save bar, which is the ticket)
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 23`)
- Surface patch and root fix explained for each: PASS (the tracking-only arrow fails the persistence check)
- Independent, no accidental extra bugs: PASS (`npm run solution 23`)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: R5, T7, D3: PASS
