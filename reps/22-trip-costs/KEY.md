# Answer key: rep 22 (Trip costs). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 22`, `npm run solution 22`). Classes: E2 (React mechanics), T3 (TypeScript lie), D5 (logic). Tickets are in shuffled order.

## 1. React mechanics: derived state in an effect with a missing dependency (TRC-150)

**Where:** `App.tsx`:
```ts
useEffect(() => {
  ...
  setConverted(lines.map((line) => ({ id: line.id, usd: ... line.amount * rate * (1 + MARKUP) ... })));
}, [trip, includeFees]);
```
**Layer:** rendering, specifically the effect's dependency contract, compounded by storing a derivable value in state.

**Why it breaks:** The effect reads `rate` and declares `trip` and `includeFees`. Changing the rate re-renders (the client-rate line updates because it's computed in render) but the effect doesn't rerun, so `converted` keeps the old numbers. Toggling fees changes a declared dependency, the effect reruns with the current rate, and the column catches up, which is the breadcrumb.

**Fix:** the conversion is a pure function of three values; compute it in render and delete the state and the effect:
```ts
const converted = visibleLines.map((line) => ({ id: line.id, usd: Math.round(line.amount * rate * (1 + MARKUP) * 100) / 100 }));
```
**Looks right but isn't:**
- Adding `rate` to the dependency array: correct output, one render late (the first render after a rate change still shows the old column), and derived state kept in a second place.
- Calling the conversion in the rate's `onChange` handler too: two code paths that must agree.
- `useMemo` with the right deps: fine and the memo isn't earning anything for five lines; derive directly.

**Fastest way to find it:** React DevTools, select `App`: `rate` changes, `converted` doesn't. `exhaustive-deps` flags the line.

**The tell:** derived values that update only when an unrelated input changes. State synced from other state in an effect, with a missing dependency.

**Say it like this:** "The USD column is state written by an effect that reads the rate but doesn't depend on it. It's derivable from the lines, the rate, and the toggle, so compute it in render and delete the effect. Adding the dependency would work and keep the wrong design."

**Production angle:** derive, don't sync; the React docs' "you might not need an effect."

## 2. TypeScript lie: a decimal-string rate passed through as a number (TRC-154)

**Where:** `api/client.ts`:
```ts
const body = await res.json();
return body.rate;        // declared Promise<number>; the wire sends "1.0800"
```
and `components/RatePanel.tsx`: `const clientRate = rate + markup;`.

**Layer:** data at the API boundary.

**Why it breaks:** `res.json()` is `any`, so `body.rate` is `any` and returning it as a `number` compiles. At runtime `rate` is `"1.0800"`. Multiplication coerces strings, so `line.amount * rate` is a correct number and the USD column looks fine, which is the breadcrumb. Addition concatenates, so `rate + markup` is `"1.0800" + 0.02`, the string `"1.08000.02"`. Typing in the rate box stores `Number(e.target.value)`, a real number, so the line heals.

**Fix:** parse at the boundary and refuse garbage:
```ts
const body = (await res.json()) as { rate: string | number };
const rate = Number(body.rate);
if (!Number.isFinite(rate)) throw new Error("Unexpected rate payload");
return rate;
```
**Looks right but isn't:**
- `Number(rate) + markup` in `RatePanel`: fixes the line, leaves a string in state for the next consumer that adds instead of multiplies.
- `rate * 1 + markup`: the same patch in disguise.
- Asking the FX service for a number: decimal strings are the right wire format for rates; the client parses.

**Fastest way to find it:** DevTools, `rate: "1.0800"` in quotes. `typeof rate` in the console.

**The tell:** a value that works in multiplication and breaks in addition. A numeric string that crossed a boundary through `any`.

**Say it like this:** "The FX endpoint sends the rate as a decimal string and the client returns it as a number through `any`. Multiplication coerces, so the column looks right; addition concatenates, so the rate line shows 1.08000.02. Parse once where it enters."

**Production angle:** a schema with `z.coerce.number()` at `fetchRate`.

## 3. Logic: cents summed as units (TRC-159)

**Where:** `api/client.ts`, `fetchTripCosts`:
```ts
amount: line.amountCents ?? line.amount ?? 0
```
**Layer:** data at the API boundary: a unit mismatch in a mapping.

**Why it breaks:** The backend sends fee lines in cents (`amountCents: 12500`) and other lines in euros. The mapping treats cents as euros, so the fee is €12,500 and the total carries the error through the conversion. Every other line is right because they arrive in euros.

**Fix:** convert units in the mapping:
```ts
amount: line.amountCents !== undefined ? line.amountCents / 100 : line.amount ?? 0,
```
**Looks right but isn't:**
- Dividing fee lines by 100 in the table: fixes the display and leaves the wrong number in state; the total is still off unless you patch that too.
- Asking the backend to send euros: it sends cents for fees on purpose (fees are integer cents in the ledger).
- A `category === "fees"` special case instead of checking the field: the next cents-denominated category breaks the same way.

**Fastest way to find it:** DevTools: the fee line's `amount` is 12500 while the others are hundreds. The wire has `amountCents` on that line.

**The tell:** one line exactly 100 times too large. Cents treated as units.

**Say it like this:** "Fee lines arrive in cents and the mapping treats them as euros. Convert in the mapping where the unit is known, so the app only ever holds euros."

**Production angle:** money in integer cents throughout the app, converted only for display; a schema that names the unit.

## Not bugs (in case you went looking)

- `Math.round(x * 100) / 100` rounds the converted amount to cents. Correct for display; in production you'd keep cents as integers.
- `Promise.all` loads the trip and the rate together so the conversion has both. Correct, and the loading gate waits for both.
- `includeFees` filtering is applied in two places (effect and `visibleLines`) in the buggy file; they agree, and the fix collapses them.
- The `usd` formatter is module-level, which is fine; `Intl.NumberFormat` objects are safe to reuse.
- `step={0.0001}` on the rate input lets advisors type four decimals.

## Generator QA
- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 22`)
- Surface patch and root fix explained for each: PASS
- Independent, no accidental extra bugs: PASS (`npm run solution 22`)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: E2, T3, D5: PASS
