# Answer key: rep 08 (Payouts). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 08`, `npm run solution 08`). Classes: F1 (React mechanics), T3 (TypeScript lie), D6 (logic). Tickets are in shuffled order.

## 1. Logic: a memo that reads more than it declares (PAY-120)

**Where:** `components/EstimatePanel.tsx`:
```ts
const estimate = useMemo(() => {
  ... pending >= threshold ... Math.max(0, threshold - pending)
}, [rows]);
```
**Layer:** derived state. The computation depends on two inputs and the cache key names one.

**Why it breaks:** `useMemo` reuses the last result while its dependencies are unchanged. `threshold` is read inside but not listed, so changing it leaves the cached estimate from the previous threshold. Refresh refetches `rows`, which is a new array, so the memo recomputes with the current `threshold` and corrects itself. That's the breadcrumb. The summary next to the box is derived directly from state, so it updates immediately, and the two disagree.

**Fix:** declare what you read:
```ts
}, [rows, threshold]);
```
**Looks right but isn't:**
- Removing `useMemo` entirely: correct output, and for five rows it's the right call; say that the memo wasn't earning its keep. It's listed here only because the interviewer wants to hear you name the dependency rule, not just delete the hook.
- Copying `threshold` into state with a `useEffect` and recomputing there: state derived from state, one render late.
- Telling users to click Refresh: the ticket already has that workaround.

**Fastest way to find it:** React DevTools, select `EstimatePanel`: the `threshold` prop changes, the memo hook's value doesn't. Or the lint rule `react-hooks/exhaustive-deps`, which flags exactly this line.

**The tell:** a derived number that only updates when something unrelated changes. Missing dependency.

**Say it like this:** "The memo reads `threshold` but only depends on `rows`, so it serves the stale estimate until rows change. Add the dependency; or drop the memo, since the computation is trivial. Either way the rule is that a memo's deps are everything it reads."

**Production angle:** `exhaustive-deps` as an error, and the React Compiler, which derives dependencies itself.

## 2. TypeScript lie: a union that lets a string pass for a number (PAY-124)

**Where:** `App.tsx`: `useState<string | number>("")` for `selectedId`; `components/PayoutTable.tsx`: `onChange={(e) => onSelect(e.target.value)}` and `rows.find((row) => row.id === selectedId)` and `row.id === selectedId` in `markReviewed`.

**Layer:** data entering state from the DOM with a type that accepts both the wrong and the right kind.

**Why it breaks:** A `<select>` delivers `e.target.value` as a string, `"7003"`. The state type `string | number` accepts it, so there is no compile error, and `row.id === selectedId` compares `7003 === "7003"`, which is false under strict equality. `find` returns undefined ("Selected: none"), and `map` changes nothing. The dropdown itself is fine because its `value` prop is also a string, which is the breadcrumb.

**Fix:** parse at the boundary and type the state honestly:
```ts
const [selectedId, setSelectedId] = useState<number | null>(null);
onChange={(e) => onSelect(e.target.value === "" ? null : Number(e.target.value))}
value={selectedId ?? ""}
```
**Looks right but isn't:**
- `row.id == selectedId`: loose equality coerces and the ticket closes, with a lint error and a type that still says "either."
- `String(row.id) === selectedId` at both comparison sites: two patches for one boundary, and the next comparison is a miss again.
- Changing the API to send ids as strings: the backend's ids are numbers; the DOM is what stringified it.

**Fastest way to find it:** React DevTools, `selectedId` shows `"7003"` in quotes while `rows[2].id` is `7003`. Or `typeof selectedId` in the console.

**The tell:** a selection that the control shows but the app doesn't recognize. A DOM value stored without parsing, with a type loose enough to allow it.

**Say it like this:** "The select hands over a string and the state type is `string | number`, so the compiler can't object, and strict equality against numeric ids never matches. Parse once where the value enters and type the state as `number | null`."

**Production angle:** never store `e.target.value` directly into typed state; a tiny `parseId` helper at the DOM boundary.

## 3. React mechanics: controlled, then uncontrolled (PAY-127)

**Where:** `App.tsx`: `useState<number | undefined>()` for `threshold`; `components/ThresholdSettings.tsx`: `value={threshold}` and Reset calling `onChange(undefined)`.

**Layer:** rendering, specifically React's controlled-input contract.

**Why it breaks:** An input with `value={undefined}` is uncontrolled: React leaves the DOM in charge of its text. Typing 750 sets state to 750, `value` becomes defined, the input becomes controlled and shows 750. Reset sets state back to `undefined`, `value` becomes undefined again, and React switches the input back to uncontrolled, logging the "changing a controlled input to be uncontrolled" warning. An uncontrolled input keeps whatever the DOM already holds, so the box still shows 750 while the summary, read from state, says default. Typing again sets state and control resumes, which is the breadcrumb.

**Fix:** keep the input controlled by a string, always, and derive the number:
```ts
const [thresholdText, setThresholdText] = useState("");
<input value={thresholdText} onChange={(e) => onChange(e.target.value)} />
Reset: onChange("")
const effectiveThreshold = thresholdText === "" ? settings.defaultThreshold : Number(thresholdText);
```
**Looks right but isn't:**
- `value={threshold ?? ""}`: the box clears on reset and the warning goes away, so it's a reasonable patch. The remaining problem is that number state can't represent what the user is typing ("1.", "-", an empty field mid-edit), which is why input state should be text with the number derived.
- Setting the state to 0 on reset instead of undefined: the box shows 0, the summary says custom $0, and the estimate is "ready" at any amount.
- A `key` on the input to remount it on reset: clears the DOM, keeps the controlled/uncontrolled flip.

**Fastest way to find it:** the console warning about switching from controlled to uncontrolled, which names the exact input. DevTools shows the `threshold` state as `undefined` while the DOM value is 750.

**The tell:** a form control that disagrees with the state that is supposed to control it, after the state was set to undefined. Controlled-to-uncontrolled.

**Say it like this:** "`value={undefined}` makes the input uncontrolled, so React stops writing to it and the DOM keeps the old text. Keep it controlled by a string that's never undefined, and derive the number from the string. `?? ''` fixes the display; string state fixes the model."

**Production angle:** inputs hold text; parsing happens at use; a form library enforces that for you.

## Not bugs (in case you went looking)

- `load` is wrapped in `useCallback` and runs once on mount via the effect; in dev, StrictMode calls it twice and both resolve to the same data.
- `Math.max(0, threshold - pending)` can't be negative. Correct.
- `monthLabel` builds a local date from parts, so there's no UTC shift (compare rep 07).
- The estimate excludes held payouts and says so. Per spec.
- `disabled={selectedId === ""}` is consistent with the buggy state type; after the fix it becomes `=== null`.

## Generator QA
- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 08`)
- Surface patch and root fix explained for each: PASS
- Independent, no accidental extra bugs: PASS (`npm run solution 08`)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: F1, T3, D6: PASS
