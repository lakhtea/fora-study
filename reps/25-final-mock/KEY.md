# Answer key: rep 25 (Today, the final mock). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 25`, `npm run solution 25`). Classes: E1 (React mechanics), T1 (TypeScript lie), D3 (logic): the three most-tested classes, in new settings. Tickets are in shuffled order.

## 1. React mechanics: stale closure in setInterval (DSH-910)

**Where:** `components/Countdown.tsx`:
```ts
useEffect(() => {
  const handle = setInterval(() => { setSecondsLeft(Math.max(0, secondsLeft - 1)); }, 1000);
  return () => clearInterval(handle);
}, []);
```
**Layer:** rendering closures.

**Why it breaks:** The effect runs once (empty deps) and the interval callback closes over the `secondsLeft` from that first render, 899. Every tick sets `899 - 1 = 898`. The first tick changes the display to 14:58; every tick after sets the same value, React bails out, and the timer freezes. That's "ticks once and sits there."

**Fix:** read the latest state through the functional updater:
```ts
setSecondsLeft((current) => Math.max(0, current - 1));
```
**Looks right but isn't:**
- Adding `secondsLeft` to the deps: the timer ticks, and the interval is torn down and recreated every second; a long interval would also drift.
- A ref mirrored from state in an effect: works, and it's the long way around the updater.
- `setInterval` outside the effect: runs on every render, multiplying intervals.

**Fastest way to find it:** DevTools: `secondsLeft` goes 899, 898, and stops. The callback uses a state variable without an updater.

**The tell:** a timer that advances exactly once. Closure over the initial value.

**Say it like this:** "The interval callback captured the first render's `secondsLeft`, so it keeps setting the same value and React bails out. The functional updater reads the latest state."

**Production angle:** derive the display from a target timestamp and `Date.now()` so there's no accumulating state at all.

## 2. TypeScript lie: a non-null assertion on a selection that can go stale (DSH-914)

**Where:** `components/TaskPanel.tsx`:
```ts
const task = tasks.find((candidate) => candidate.id === selectedId && !candidate.done)!;
```
and `App.tsx`, `handleComplete`, which marks the task done but leaves `selectedId` pointing at it.

**Layer:** state consistency, hidden by an assertion.

**Why it breaks:** The lookup excludes done tasks, so completing the selected task makes `find` return `undefined`; the `!` erased that possibility, `task.title` throws during render, and the page blanks. Completing a different task doesn't change the lookup's result.

**Fix:** handle the miss, and clear the selection in the handler that invalidates it:
```ts
const task = tasks.find(...);
if (!task) return <div className="panel empty">That task is done.</div>;
```
```ts
setSelectedId((current) => (current === id ? null : current));
```
**Looks right but isn't:**
- `?.` only: no crash, blank panel, and `selectedId` still points at a done task.
- Clearing the selection in a `useEffect` on `tasks`: render runs first, crashes first.
- An error boundary around the panel: contains the symptom.

**Fastest way to find it:** the console error names `TaskPanel` and `title`. Search for `!` after `find`.

**The tell:** a crash only when the thing you're looking at is the thing you removed. Two states allowed to disagree.

**Say it like this:** "`find` can miss once the selected task is done, and the assertion told the compiler it couldn't. Handle undefined in the panel and clear the selection in the same handler that completes the task."

**Production angle:** derive selection validity from the data; a lint ban on non-null assertions.

## 3. Logic: two objects merged with a shared key (DSH-918)

**Where:** `components/SpotlightCard.tsx`:
```ts
const card = { ...client, ...spotlight };
... card.name ...
```
**Layer:** data transformation: last-writer-wins on `name`.

**Why it breaks:** `client.name` is "Maya Okafor"; `spotlight.name` is "Lisbon long weekend." The spread puts the spotlight last, so its `name` overwrites the client's. Phone and email have no collision, so they're right, which is the breadcrumb. The trip line reads `spotlight.name` directly, so it's right too.

**Fix:** don't merge objects with overlapping keys; read each from its source:
```tsx
<strong>{client.name}</strong>, {client.city}
{spotlight.name}: departs {formatDate(spotlight.departs)}, {money(spotlight.total)}, {spotlight.status}
```
**Looks right but isn't:**
- Reordering the spreads: fixes `name` and now the trip's `total` and `status` are at risk the first time the client record grows a `status`.
- Renaming `spotlight.name` to `tripName` on the server: the backend's shape is fine; the client merged two things that shouldn't be merged.
- `card.name = client.name` after the merge: a patch on a patch.

**Fastest way to find it:** DevTools: the `card` object has `name: "Lisbon long weekend"` next to `phone: "+1 718..."`. Two sources, one object, one key.

**The tell:** a field showing a plausible value from the wrong object while unrelated fields are right. A merge with a shared key.

**Say it like this:** "The card spreads the spotlight over the client and both have a `name`, so the trip's name wins. Read each field from its own object; merging two records with overlapping keys always loses one."

**Production angle:** typed view models built field by field; never spread two domain objects into one.

## Not bugs (in case you went looking)

- `tasks.filter((task) => !task.done)` in the list and the `!candidate.done` in the panel's lookup agree on what "open" means.
- `Math.max(0, ...)` keeps the countdown from going negative.
- `handleComplete` replaces the task with the server's response. Correct.
- The greeting date is static text in this demo.
- `resetServer` exists for the tests.

## Generator QA
- Page renders on load with no console errors: PASS
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 25`)
- Surface patch and root fix explained for each: PASS
- Independent, no accidental extra bugs: PASS (`npm run solution 25`)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: E1, T1, D3: PASS
