# Answer key: rep 06 (Client settings). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 06`, `npm run solution 06`). Classes: R3 (React mechanics), T5 (TypeScript lie), E8 (async failure). Tickets are in shuffled order.

## 1. React mechanics: props copied into state once (SET-801)

**Where:** `components/SettingsForm.tsx`:
```ts
const [form, setForm] = useState<ClientSettings>(settings);
```
and `App.tsx`, which renders `<SettingsForm settings={settings} ... />` for whichever client is selected.

**Layer:** state consistency across a prop change. The form seeded its state from a prop once and never again.

**Why it breaks:** `useState(initial)` reads the argument only on the first render of that component instance. When the selected client changes, `App` passes new `settings` to the same `SettingsForm` instance, so the heading (read from the prop) shows Daniel while `form` (state) is still Maya. `dirty` compares the two and lights "Unsaved changes" with no typing. A reload mounts a fresh instance, which is the breadcrumb.

**Fix:** a new client is a new form. Remount it by identity:
```tsx
<SettingsForm key={settings.id} settings={settings} directory={directory} onSaved={setSettings} />
```
**Looks right but isn't:**
- `useEffect(() => setForm(settings), [settings])`: the form catches up one render late (a flash of the previous client), it throws away in-progress edits any time the parent re-fetches, and it's state derived from props held in two places. It also runs after the save callback replaces `settings`, which happens to be fine here and is a trap later.
- Lifting `form` into `App` and resetting it in the click handler: works, and now `App` owns the form's keystrokes.
- Clearing `settings` to null between clients so the form unmounts: works by accident, with a "Loading" flash that the spec doesn't ask for.

**Fastest way to find it:** React DevTools, select `SettingsForm` after clicking Daniel: the `settings` prop is Daniel, the `form` hook is Maya, and the component instance didn't remount (same position, same key). Then look at how `form` is initialized.

**The tell:** a child shows stale values after its parent changed what it passes in, and a reload fixes it. Initial state from props.

**Say it like this:** "The form seeds its state from the prop on mount, and switching clients reuses the same instance, so state and prop disagree. Keying the form by client id tells React this is a different form; it remounts with fresh state. Syncing in an effect would hide it and clobber edits later."

**Production angle:** keep editable copies keyed by the record's id, or use a form library whose `reset` is called explicitly when the record changes.

## 2. TypeScript lie: an index signature that promises every key exists (SET-804)

**Where:** `types.ts`: `export type TravelerDirectory = Record<number, Traveler>;` and every lookup, `directory[id].name`, in `components/SettingsForm.tsx` (household line) and `components/TravelerList.tsx`.

**Layer:** data consistency between two endpoints, hidden by a type. The client's record references ids; the directory endpoint omits archived travelers.

**Why it breaks:** `Record<number, Traveler>` types `directory[905]` as `Traveler`, so `.name` compiles. The directory is built from `/api/travelers`, which excludes archived travelers, so `directory[905]` is `undefined` at runtime and `.name` throws, during render, which blanks the page. Hiro is the only client whose record points at an archived traveler. "We archived him as a traveler" is the breadcrumb.

**Fix:** make the type tell the truth and handle the miss where it's read:
```ts
export type TravelerDirectory = Partial<Record<number, Traveler>>;
```
```tsx
// SettingsForm household line and TravelerList rows
const traveler = directory[id];
const label = traveler ? traveler.name : `Archived traveler (#${id})`;
```
With the `Partial`, every `directory[id].name` becomes a compile error until it's handled, which is the point.

**Looks right but isn't:**
- `directory[id]?.name` at the crash site only: the page renders, the household line silently drops a name, and the count still says 2 while 1 is shown. The next lookup someone writes crashes the same way because the type still lies.
- Filtering `travelerIds` to known ids when settings load: hides that the client has an archived traveler, and the next save writes the filtered list back, deleting the link.
- Including archived travelers in the directory response: the backend excludes them on purpose (they shouldn't be linkable).
- Enabling `noUncheckedIndexedAccess`: catches this class project-wide, which is the right production move, but it's a tsconfig change, not a fix to this page.

**Fastest way to find it:** the console: "Cannot read properties of undefined (reading 'name')" with `SettingsForm` in the stack. DevTools shows `directory` with five keys and Hiro's `travelerIds` with a sixth.

**The tell:** a crash for one record while the others are fine, with a lookup table built from a different source than the ids. The index signature promised a value it couldn't.

**Say it like this:** "`Record<number, Traveler>` tells the compiler every id resolves, but the directory comes from an endpoint that omits archived travelers, so the lookup is undefined at runtime. Type it as `Partial` so the compiler forces a check, and render the archived case explicitly instead of hiding it."

**Production angle:** `noUncheckedIndexedAccess`, or a `Map` with `.get()` returning `T | undefined`, and resolve references on the server so the client never holds dangling ids.

## 3. Async failure: a rejected save that never resets the UI (SET-807)

**Where:** `components/SettingsForm.tsx`, `handleSave`:
```ts
setSaving(true);
saveSettings(form)
  .then((saved) => { setSaving(false); ... })
  .catch(console.error);
```
**Layer:** async failure handling. The error reached the console and nothing else.

**Why it breaks:** The backend rejects the phone (`422`, "Phone may only contain digits, spaces, dashes, and a leading +"). `saveSettings` throws with that message, which is correct. The component only resets `saving` on the success path, and the catch logs instead of recovering, so the button stays "Saving" and disabled, and the message never reaches the screen. Digits-and-spaces passes validation, which is the breadcrumb.

**Fix:** reset in `finally`, show the reason, keep the edits:
```ts
const handleSave = async () => {
  setSaving(true);
  setError(null);
  try {
    const saved = await saveSettings(form);
    setSavedAt(new Date().toLocaleTimeString());
    onSaved(saved);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Saving failed");
  } finally {
    setSaving(false);
  }
};
```
and render `error` in a `role="alert"` near the form.

**Looks right but isn't:**
- `.finally(() => setSaving(false))` and nothing else: the button comes back, the status says "Unsaved changes," and the advisor has no idea the server refused. They'll click Save three more times.
- Stripping parentheses on the client before sending: fixes this one input, hides the error class, and the next validation rule (country code required) hangs the form again.
- Validating the phone on the client with the same regex: good UX, still doesn't handle a server rejection, which can happen for any reason.

**Fastest way to find it:** the console shows the error (the catch logs it), and the Network panel shows a 422. DevTools shows `saving: true` with no request in flight.

**The tell:** a pending state that never ends after an action that can fail. Success-only reset.

**Say it like this:** "The save can reject, and the code only resets `saving` on success; the catch logs and drops the error. Reset in `finally`, put the server's message into state and show it, keep the form so the user can fix the phone. Logging is not handling."

**Production angle:** a mutation hook (TanStack Query `useMutation`) that exposes `isPending` and `error` so the pending state can't leak, and client-side validation mirrored from the server's rules.

## Not bugs (in case you went looking)

- `isDirty` compares with `JSON.stringify`: key order is stable here because both objects come from the same shape, so it's correct for this form. Say you'd use a deep-equal in production.
- `onSaved(saved)` replaces the parent's `settings` with the server's response, which makes `dirty` false after a save. Correct.
- The archived traveler 905 is still in Hiro's `travelerIds` on the server. That's the data, and it's what bug 2 is about.
- `Promise.all` on load means both the client list and the directory are needed before the form shows. Per spec.
- `SETTINGS[id] = { ...body, id }` in `server.ts` persists saves for the session; reloading the page resets it. That's the mock backend.

## Generator QA
- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 06`)
- Surface patch and root fix explained for each: PASS
- Independent, no accidental extra bugs: PASS (`npm run solution 06`; the household line exists so bug 2 reproduces even while bug 1 holds the form on Maya)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: R3, T5, E8: PASS
