// The two mechanisms from your Thumbtack pairing rep, as pure utilities, so you can explain them cold.
// 1. debounce: calling the returned function resets a timer; the wrapped function runs once, with the
//    latest arguments, after `ms` of quiet. `cancel()` drops a pending call. (Delay is not debounce:
//    a delay fires once per call; a debounce cancels the previous timer.)
// 2. latestOnly: wraps an async function so that only the most recent call's result is delivered.
//    Older calls still complete, but their results are ignored. Say that sentence out loud.

export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number): ((...args: A) => void) & { cancel: () => void } {
  throw new Error("not implemented");
}

export function latestOnly<A extends unknown[], R>(fn: (...args: A) => Promise<R>): (...args: A) => Promise<R | undefined> {
  throw new Error("not implemented");
}
