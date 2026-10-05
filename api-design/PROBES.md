# Probes the interviewer will use after minute 35, with the answer shape

- Two advisors edit the same itinerary at once. Optimistic concurrency: writes carry the version they read; the server rejects stale writes with 409 and returns the current object; the UI shows a merge prompt or auto-retries non-conflicting fields. Real-time co-editing needs a server-ordered event stream with sequence numbers.
- The supplier's rates API takes 8 seconds sometimes and fails 2% of the time. Never in the page-load path. Cache rates with a TTL, refresh asynchronously, show "rates as of 10:42", retries with exponential backoff and jitter, a circuit breaker serving cached data when the supplier is down, a job queue for bulk refreshes.
- Stop a double booking or double charge. Client idempotency key on the POST stored with the result; a unique constraint in the database as the last line of defense; a status state machine so a retry can't confirm twice.
- 200,000 bookings in this list. Cursor pagination on an indexed sort key, server-side filtering and sorting, bounded page size, counts as a separate cheap endpoint or an estimate, a search index for free text.
- How does the client know the AI draft is done. Stream over SSE token by token into a pending block; if not, 202 with a job id and polling with backoff; push for long jobs.
- Change the API without breaking the mobile app. Additive only, never rename or remove in place, feature flags for behavior changes, deprecation headers and a sunset date, a path version only for true breaks.
- Security. Auth on every endpoint, authorization on the resource (this advisor owns this client), input validation, PII minimization, per-user rate limits, signed webhook payloads with idempotent processing.
- This screen needs five resources. Expansion parameters (`?include=days,items`) with a cap, or a screen-specific BFF endpoint. Trade-off: fewer round trips versus a coupled endpoint.
- Why REST and not GraphQL. REST fits a Django backend and a small team; GraphQL earns its cost when many clients need different shapes of the same graph. Name the trade-off and move on.
- What would you instrument. Latency per endpoint, error rate by code, 409 frequency, retry counts, supplier circuit-breaker state.
