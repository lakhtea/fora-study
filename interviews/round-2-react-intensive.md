# Round 2, hour 2: React Intensive (60 minutes)

Most likely a build from a spec in a CoderPad React pad against a provided fake API, with performance expectations; possibly a profile-and-fix hour; possibly conceptual with DevTools open. The five apps in `../apps/` are the build drills; app 04 is the profiling lab.

## The 60-minute build budget

0 to 5: read the spec, list requirements in a comment, ask about data shape, empty and error states, what "done" means, sketch the component tree and where state lives. 5 to 15: static skeleton with fake data, rendered. 15 to 35: state and interactions one at a time, each verified in the preview before the next. 35 to 45: data fetching with loading, error, empty, a race guard, debounce the network call only. 45 to 52: polish, labels and keyboard access, edge cases, a Profiler pass if the list is large, memo only where measured. 52 to 58: what you'd test, what you'd do with more time, remove dead code. 58 to 60: recap.

## React DevTools tour

Components tab: select a component to see props, state, hooks in order, and "rendered by"; edit props and state live; the crosshair goes from page element to component; Settings, General, "Highlight updates when components render"; Components settings, "Record why each component rendered while profiling" (turn on before recording); `$r` in the console is the selected instance.

Profiler tab: record, do the slow thing, stop. One commit per screen update; flamegraph shows width as time, gray as did not render; Ranked view sorts by render time; click a bar for "Why did this render?" (props changed, hooks changed, parent rendered); base duration versus actual duration shows whether memoization is working; "Reload and profile" captures the initial mount.

## Performance playbook

Typing lags in a search box: move the input state down, memoize the list and row, `useDeferredValue` for the query, debounce only the network call. Everything re-renders on one change: colocate state, split context by update frequency, pass children through the provider. Memoized child still renders: an inline object, array, or function prop; `useCallback` and `useMemo` with correct deps, hoist constants, pass ids and primitives. Long list scroll is janky: virtualize, stable keys. Expensive computation each render: `useMemo`, worker, precompute. Interaction blocks the UI: `startTransition`. Slow first paint: code-split, server components for static parts. Order: state placement and composition first, memoization second, virtualization and deferral third; say why.

## Fourteen concepts, under a minute each (record them)

1. Render vs commit. 2. Reconciliation and keys. 3. Batching (React 18 batches everywhere; `flushSync` opts out). 4. Closures and hooks (each render has its own values; updater, ref, or deps). 5. The memo trio and when not to. 6. React Compiler (automatic memoization for code that follows the rules; still profile). 7. Context and re-renders. 8. Suspense and transitions. 9. Server vs client components; keep the client boundary low. 10. Hydration (nothing non-deterministic in render). 11. React 19 forms and actions (`useActionState`, `useFormStatus`, `useOptimistic`, `use`, ref as a prop). 12. Error boundaries. 13. Client data fetching (TanStack Query: keys, stale-while-revalidate, invalidation, optimistic updates). 14. Testing strategy (Vitest, RTL through the DOM, MSW, a few Playwright flows; your Cypress to Vitest story).

## Profiling drills (on app 04 after you've built it, or on its naive version)

A. Record while typing; read the flamegraph and ranked view aloud; name the problem before touching code. B. Fix it three ways (state colocation, memo plus useCallback, useDeferredValue) and compare actual durations. C. Add a Context holding the theme and the filter; show the over-render; split it. D. Show "why did this render" on a memoized row that still renders because of an inline style object.

## Questions this hour tends to ask

Walk me through what happens from click to DOM update. This list re-renders on every keystroke; find out why and fix it. Context vs a store vs URL state. Race conditions in async effects. What to make a server component. How you'd structure a rich editor with autosave (local state per block, a debounced save queue keyed by block id, optimistic status, 409 handling). What you test and what you don't. How you use AI in React work and where you don't trust it (your Cursor rules and design-system conventions).
