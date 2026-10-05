# Solution notes: debounce and latest-only

```ts
export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let handle: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: A) => {
    if (handle !== undefined) clearTimeout(handle);
    handle = setTimeout(() => { handle = undefined; fn(...args); }, ms);
  };
  debounced.cancel = () => { if (handle !== undefined) clearTimeout(handle); handle = undefined; };
  return debounced;
}
```
Your two logged bugs: a delay (no clearTimeout, so every call fires), and in React returning `clearTimeout(handle)`'s result from the effect instead of a function (`return () => clearTimeout(handle)`).

```ts
export function latestOnly<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  let latest = 0;
  return async (...args: A): Promise<R | undefined> => {
    const ticket = ++latest;
    const result = await fn(...args);
    return ticket === latest ? result : undefined;
  };
}
```
Say it precisely: "The guard runs when the await resumes, after the request completes. It blocks delivery of a stale result; it doesn't stop the request. Ordering isn't about promises resolving after synchronous code; it's that each call checks whether a newer call has started since." In React the ticket is a `cancelled` flag per effect run, set in cleanup.
