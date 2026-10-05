# Answer key: rep 09 (Supplier onboarding). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 09`, `npm run solution 09`). Classes: M1 (React mechanics), T1 (TypeScript lie), D6 (logic). Tickets are in shuffled order.

## 1. React mechanics: memo defeated by inline props (ONB-301)

**Where:** `App.tsx`, inside the `required.map`:
```tsx
<ChecklistRow ... tone={{ opacity: doc?.received ? 1 : 0.75 }} onToggle={() => toggle(kind)} />
```
and `components/ChecklistRow.tsx` is wrapped in `memo`, with a 4 ms synthetic cost per render and a `data-renders` counter.

**Layer:** rendering (memoization and referential equality).

**Why it breaks:** `memo` skips a re-render only when every prop is shallowly equal to last time. Two props are created fresh on every render of `App`: the `tone` object literal and the `onToggle` arrow. Typing in the name box sets state in `App`, `App` re-renders, every row receives a new object and a new function, every row re-renders and pays its cost. Four rows at 4 ms is a visible stutter per keystroke; in the real checklist it was worse. Ticking a box is "also sluggish" because the same thing happens then.

**Fix:** stable references for props that don't change:
```ts
const TONE_RECEIVED: CSSProperties = { opacity: 1 };
const TONE_PENDING: CSSProperties = { opacity: 0.75 };
const toggle = useCallback((kind: DocumentKind) => { setRecord(...) }, []);   // before the early return
<ChecklistRow tone={doc?.received ? TONE_RECEIVED : TONE_PENDING} onToggle={toggle} />
```
with the row calling `onToggle(kind)` so one stable callback serves every row.

**Looks right but isn't:**
- Hoisting the `tone` objects and leaving the inline arrow: the arrow alone defeats the memo. The acceptance test checks the render counters, so a half fix fails.
- `useCallback(() => toggle(kind), [kind])` inside the map: hooks can't be called in a loop; and if you tried it per row you'd have four callbacks anyway.
- A custom `propsAreEqual` that ignores `onToggle` and compares `tone` deeply: works and hides the problem; the next inline prop someone adds breaks it silently.
- `useMemo` on the whole list: the rows still re-render when the list does.

**Fastest way to find it:** React DevTools Profiler with "Record why each component rendered": every `ChecklistRow` shows "props changed: tone, onToggle" on each keystroke. Or watch `data-renders` climb in the Elements panel.

**The tell:** a memoized child that re-renders on every parent render, with "props changed" naming an object or a function. New references.

**Say it like this:** "The rows are memoized but receive a new style object and a new arrow function every render, so shallow comparison fails and the memo never skips. Hoist the constants, make the toggle a stable `useCallback` that takes the kind, and the rows only re-render when their own document changes. Memoization is only as good as the references you pass."

**Production angle:** the React Compiler automates this; until then, `react/jsx-no-constructed-context-values`-style lint rules and the Profiler's "why did this render" in review.

## 2. TypeScript lie: a non-null assertion on a lookup the data doesn't guarantee (ONB-305)

**Where:** `components/ReviewPanel.tsx`:
```ts
const doc = reviewKind === "" ? null : documents.find((candidate) => candidate.kind === reviewKind)!;
```
**Layer:** state consistency between two lists, hidden by an assertion. The select is built from `required`; the lookup is against `documents`; nothing guarantees every required kind has a document.

**Why it breaks:** `find` returns `SupplierDocument | undefined`. The `!` erases the `undefined`, so `doc.fileName` compiles. For a required kind that was never uploaded (bank details, for this supplier), `find` returns `undefined`, `doc.fileName` throws during render, and the tree unmounts: a white page. Uploaded kinds are fine, which is the breadcrumb.

**Fix:** handle the miss, and make it visible in the select so the reviewer knows what to chase:
```tsx
const doc = reviewKind === "" ? null : documents.find((c) => c.kind === reviewKind);
const uploaded = new Set(documents.map((c) => c.kind));
<option>{KIND_LABELS[kind]}{uploaded.has(kind) ? "" : " (missing)"}</option>
{reviewKind === "" ? <p>Pick...</p> : !doc ? <p className="danger">{KIND_LABELS[reviewKind]} has not been uploaded yet.</p> : <dl>...</dl>}
```
**Looks right but isn't:**
- `doc?.fileName` with no message: no crash, and the panel is blank, so the reviewer thinks the page is broken rather than the supplier incomplete.
- Filtering the select to uploaded kinds only: the reviewer can no longer see which required documents are missing, which is the one thing this screen is for.
- An error boundary around the panel: contains the crash, leaves the lie.

**Fastest way to find it:** the console: "Cannot read properties of undefined (reading 'fileName')" in `ReviewPanel`. Search for `!` after `find`.

**The tell:** a crash for one option and not others, where the option list and the data list come from different sources. A `!` is what hid it.

**Say it like this:** "The select lists required kinds and the lookup runs against uploaded documents; the non-null assertion told the compiler every required kind exists. It doesn't. Handle the undefined explicitly and show the missing state, because a missing document is information, not an error."

**Production angle:** a lint ban on non-null assertions; derive the review list from a join of required and uploaded so "missing" is a first-class state.

## 3. Logic: a memo that ignores one of its inputs (ONB-309)

**Where:** `components/CompletionRing.tsx`:
```ts
const percent = useMemo(() => {
  const received = required.filter(...).length;
  return Math.round((received / required.length) * 100);
}, [documents]);
```
**Layer:** derived state. Two inputs, one dependency.

**Why it breaks:** `required` changes when the supplier type changes (hotel needs four, activity three, transfer four with a vehicle registration). The memo depends only on `documents`, so switching the type leaves the percent cached from the previous requirement set, while the "N required documents" line below it reads `required` directly and updates. Ticking any box changes `documents`, the memo recomputes with the current `required`, and the ring jumps to the right number. That's the breadcrumb.

**Fix:**
```ts
}, [documents, required]);
```
**Looks right but isn't:**
- Dropping the memo: correct output; fine for this size. Say the rule anyway.
- Keying the ring on the type (`<CompletionRing key={record.type} />`): remounts and recomputes, a remount to fix a dependency list.
- Recomputing in a `useEffect` into state: one render late and derived state in two places.

**Fastest way to find it:** React DevTools, select `CompletionRing`: the `required` prop changes length, the memo hook's value doesn't. `exhaustive-deps` flags the line.

**The tell:** two numbers next to each other derived from the same input, one updates and one doesn't. Missing dependency.

**Say it like this:** "The percent reads `required` and `documents` but only depends on `documents`, so a type change serves the stale value until a document changes. Add the dependency; the memo's deps must be everything it reads."

**Production angle:** `exhaustive-deps` as an error; the React Compiler.

## Not bugs (in case you went looking)

- `expensiveRender()` in the row is a deliberate 4 ms cost standing in for a heavy row; its comment says so. Fixing bug 1 doesn't remove it; it makes it run only when needed.
- `useRef` for the render counter is the standard way to count renders without causing one.
- `complete` in `App` is computed directly, not memoized, so Submit's enabled state is always right even while bug 3 holds the ring stale.
- `key={kind}` on rows is a stable identity; kinds are unique per type.
- The early return before `required` is computed is fine for the buggy code; in the fix, `useCallback` has to move above it because hooks can't follow an early return.

## Generator QA
- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 09`)
- Surface patch and root fix explained for each: PASS (the half fix for bug 1 fails the render-counter check)
- Independent, no accidental extra bugs: PASS (`npm run solution 09`)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: M1, T1, D6: PASS
