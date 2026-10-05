# App 04: Rates grid (60 minutes)

**Skill:** performance. Rendering 5,040 rows without lag, keeping a filter box responsive, memoizing rows correctly, deferring expensive updates, windowing by hand, and proving it in the React DevTools Profiler. This is also the lab for the profiling drills in the tracker.

Run `npm run app 4`. Build `App.tsx` plus components and `api/client.ts`. Backend: `api/server.ts` returns all 5,040 rates in one response (readable, not changeable). When done: `npm run accept 4`.

## Spec (from the PM)

> The rate desk wants every rate for the quarter on one screen with a filter box that doesn't stutter. They mark rates as reviewed one at a time while scanning.

## Acceptance behaviors

1. On load, GET `/api/rates` and show the count in the header (`aria-label="Rate count"`, e.g. "5,040 rates").
2. A filter input (`aria-label="Filter rates"`) narrows rows by hotel, city, or room type as you type, with the typed text appearing in the input immediately even while the list is catching up (use `useDeferredValue` or a transition). The count updates to the filtered number.
3. Column header buttons `Hotel`, `Date`, `Nightly` sort; clicking again flips.
4. Each row has a checkbox (`aria-label="Reviewed <id>"`) that toggles a reviewed flag held in state. Toggling one row must not re-render the other rows (prove it with the Profiler; the acceptance test checks a render counter you expose as `data-renders` on each row, which must stay at 1 for untouched rows after a toggle).
5. Only the rows in or near the viewport are mounted: the table body is a windowed list (a scroll container `aria-label="Rates viewport"` of fixed height with top and bottom spacers), so the DOM holds at most 60 rows at a time. Write the windowing yourself (row height is fixed; compute start and end from `scrollTop`).
6. A "Reviewed: N" line (`aria-label="Reviewed count"`) updates immediately on toggle.
7. Unavailable rates render with class `unavailable` and a muted price.

## Narrate as you build

Measure before and after each optimization with the Profiler and say the numbers. Order of operations: correct first, then measure, then memoize rows with a stable toggle handler (`useCallback` plus an id argument, or a ref map), then defer the filter, then window. Explain why state placement comes before memoization.

## Time budget

0-5 plan, 5-15 naive table (it will lag; that's the baseline), 15-25 memoized rows with stable handlers, 25-35 deferred filter, 35-50 windowing, 50-58 Profiler pass and sort, 58-60 recap.
