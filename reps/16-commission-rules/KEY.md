# Answer key: rep 16 (Commission rules). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 16`, `npm run solution 16`). Classes: M3 (React mechanics), T6 (TypeScript lie), D6 (logic). Tickets are in shuffled order.

## 1. React mechanics: keystroke state held too high in the tree (CMR-901)

**Where:** `components/RuleEditor.tsx`: `onChange={(e) => update(rule.id, { rate: Number(e.target.value) })}` writes every keystroke into `App`'s `rules` state; `App.tsx` renders `<PreviewTable rules={rules} />`, which costs about 25 ms per render.

**Layer:** rendering, specifically where state lives.

**Why it breaks:** The rate input is controlled by the shared `rules` array in `App`. Each keystroke replaces `rules`, `App` re-renders, and `PreviewTable` receives new `rules`, so it re-renders and pays its cost. The preview's content doesn't need to change until the rate is final, but nothing distinguishes "typing" from "committed." Ticking enabled is one update, so it's one pause.

**Fix:** keep the draft where it's typed; commit on blur:
```tsx
function RateField({ rule, onCommit }) {
  const [draft, setDraft] = useState(String(rule.rate));
  return <input value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={() => { const n = Number(draft); if (Number.isFinite(n) && n !== rule.rate) onCommit(n); else setDraft(String(rule.rate)); }} />;
}
```
The preview then re-renders once per committed change, which the acceptance test checks with the render counter.

**Looks right but isn't:**
- `React.memo(PreviewTable)`: `rules` is a new array on every keystroke, so the memo never skips. Memoization doesn't help when the prop really changes.
- Debouncing the `onChange` into `rules`: fewer renders, and the preview still re-renders while you pause mid-number; and the input lags behind what's typed if you debounce the value itself.
- `useDeferredValue(rules)` in the preview: keeps the input responsive and still re-renders the preview for every keystroke, just later. Better UX, same work.
- `startTransition` around `setRules`: same as deferring; the work still happens.

**Fastest way to find it:** React DevTools Profiler, record while typing: a commit per keystroke with `PreviewTable` as the top bar, "props changed: rules." Or watch `data-renders` climb.

**The tell:** an expensive sibling re-renders on every keystroke in an unrelated input. The keystrokes are stored in state that the sibling depends on.

**Say it like this:** "The rate input writes every keystroke into the shared rules state, so the heavy preview re-renders per character. Keep the draft local to the field and commit on blur; then the preview renders once per real change. Memoizing the preview wouldn't help because the prop really changes each time."

**Production angle:** form state separated from committed state; the React Compiler doesn't fix this one, because the prop is new each render.

## 2. TypeScript lie: a nullish default that invents a rate (CMR-904)

**Where:** `components/PreviewTable.tsx`:
```ts
const rate = rules.find((rule) => rule.tier === booking.tier && rule.enabled)?.rate ?? 0;
```
**Layer:** data semantics hidden by a default. "No rule" and "0%" are different facts; `?? 0` merges them.

**Why it breaks:** `find` returns `undefined` for boutique bookings (there is no boutique rule). `?.rate ?? 0` turns that into a zero rate, so each boutique row shows $0 and the total silently excludes 446 bookings. Nothing on the page can tell the two cases apart because the code erased the difference at the point it could have reported it.

**Fix:** keep the three cases distinct and show them:
```ts
function commissionFor(booking, rules): number | null {
  const rule = rules.find((c) => c.tier === booking.tier);
  if (!rule) return null;          // no rule
  if (!rule.enabled) return 0;      // rule exists, switched off
  return Math.round(booking.gross * (rule.rate / 100));
}
```
with the row showing "No rule" for `null`, and a count of unruled bookings in a `role="alert"` under the total.

**Looks right but isn't:**
- Defaulting to the standard rate: the numbers look plausible and are invented; the finance team pays boutique suppliers on a made-up rate.
- Filtering boutique bookings out of the sample: the total is "right" for a sample that no longer represents the quarter, and the problem is invisible.
- A console warning: not where the user is looking.

**Fastest way to find it:** 446 rows at $0 with a `?? 0` on the only lookup that can miss. DevTools: `rules` has two entries and the sample has three tiers.

**The tell:** zeros where a number can't be zero, a lookup that can miss, and a `?? 0` right after it.

**Say it like this:** "The nullish default turns 'no rule' into a zero rate, so missing rules look like free bookings. Return null for no rule, zero for a disabled rule, and show both; the total should say how many bookings it couldn't price."

**Production angle:** make `commissionFor` return a discriminated result so the compiler forces callers to render the missing-rule case.

## 3. Logic: a memo that depends on half its inputs (CMR-908)

**Where:** `components/PreviewTable.tsx`:
```ts
const totals = useMemo(() => { ... bookings.reduce(...) ... }, [rules]);
```
**Layer:** derived state. The totals read `bookings` and `rules` and depend only on `rules`.

**Why it breaks:** Switching the quarter replaces `bookings`. The heading reads `totals.count`... no, the heading reads `quarter` from props and the rows map over `bookings` directly, so they change; the memoized totals keep the last result computed from Q3's bookings. Nudging a rate changes `rules`, the memo reruns with the current bookings, and the total corrects itself, which is the breadcrumb.

**Fix:**
```ts
}, [rules, bookings]);
```
**Looks right but isn't:**
- Dropping the memo: correct, and here it's a real cost (a reduce over 2,000 rows on every render); keep the memo and fix the deps.
- Keying `PreviewTable` by `quarter` so it remounts: works by remounting, and a remount for a dependency list is the wrong tool.
- Recomputing totals in an effect into state: one render late, derived state in two places.

**Fastest way to find it:** `exhaustive-deps` flags the line. DevTools: the `bookings` prop changes, the memo hook's value doesn't.

**The tell:** a heading and a total that should agree and don't, with the total catching up on an unrelated edit. Missing dependency.

**Say it like this:** "The totals memo reads bookings but only depends on rules, so a new sample serves the old totals until a rule changes. Add bookings to the deps; a memo's deps are everything it reads."

**Production angle:** `exhaustive-deps` as an error; the React Compiler.

## Not bugs (in case you went looking)

- `simulateHeavyRender()` is the deliberate 25 ms cost; its comment says what it stands in for. Fixing bug 1 doesn't remove it; it stops paying it per keystroke.
- `update` in `RuleEditor` builds a new array with a new object for the changed rule. Immutable and correct.
- `bookings.slice(0, 12)` for the rows: the full sample feeds the totals; the table shows a window. Per spec.
- `Number(e.target.value)` on an empty number input gives 0, which is fine for a rate while typing and is replaced by the draft approach in the fix.
- The `seeded` generator in `server.ts` makes the sample deterministic so the totals in the tests are stable.

## Generator QA
- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 16`)
- Surface patch and root fix explained for each: PASS (a memo-only patch fails the render-counter check)
- Independent, no accidental extra bugs: PASS (`npm run solution 16`)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: M3, T6, D6: PASS
