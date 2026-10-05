# API Design hour (round 2, first 60 minutes)

Fora's prompt shape, from candidate reports: "given a feature, figure out all the APIs to make it work." For a frontend role, expect the twist: design the contract, then show how the UI consumes it. Sixty minutes means the interviewer pushes past the endpoint table into concurrency, failures, scale, and third-party unreliability.

How to run a rep: open a prompt from `prompts/`, start a 60-minute timer, work in a plain text doc or whiteboard app, and have Claude play the interviewer in a fresh chat with this instruction: "Play a Fora engineer running a 60-minute API design round. Give me the prompt in prompts/0N.md, answer clarifying questions in character, and after minute 35 start probing with the questions in api-design/PROBES.md. Grade me afterward against api-design/RUBRIC.md." After the rep, compare with the model answer if one exists.

## The 60-minute script

1. Frame (0 to 6). Who uses it, on what device, how often. Scope into a numbered list of user actions. Ask about scale, auth, whether the backend exists, what's out of scope. Write functional and non-functional requirements as two short lists. Say the order you'll cover things in.
2. Model (6 to 14). Entities, relationships, ids. Server-owned fields (timestamps, status, version) versus client-set. Draw the state machine for anything with a lifecycle.
3. Endpoints (14 to 30). A full table by resource: method, path, purpose, caller, auth. Create, read one, list, update, delete, plus non-CRUD actions (publish, duplicate, send, retry). Name conventions as you go.
4. Payloads (30 to 38). Request and response shapes for the three most important endpoints. One error shape everywhere. Validation rules for writes.
5. Hard parts (38 to 50). Two or three, deep: concurrent edits (version, 409, conflict UI), idempotency for anything that books or pays, cursor pagination, long-running work (202 and a job resource, SSE for streaming), flaky third parties (timeouts, retries with backoff and jitter, circuit breaker, cached last-known values with a TTL), permissions enforced server-side, rate limits, additive versioning.
6. Frontend consumption (50 to 57). Data layer (TanStack Query or SWR) with cache keys and invalidation, optimistic updates with rollback, loading, error, and empty states, refresh and offline behavior, whether a screen needs a BFF endpoint.
7. Close (57 to 60). Four-sentence summary, what you'd cut for v1, what you'd instrument.

## Conventions cheat sheet

- Naming: plural nouns, one level of nesting (`/itineraries/{id}/items`), actions as sub-resources (`POST /itineraries/{id}/publish`).
- Status codes: 200 read/update, 201 created, 202 accepted (async), 204 deleted, 400 validation, 401, 403, 404, 409 conflict, 422 semantic, 429, 5xx.
- Pagination: cursor-based for large or changing lists (`?cursor=&limit=`, response has `next_cursor`); offset only for small admin tables. Say why cursors don't skip or duplicate when data changes.
- Filtering and sorting: `?status=draft&sort=-updated_at`; echo applied filters in the response.
- Partial updates: PATCH with only changed fields; carry `version` or `updated_at`; 409 on stale writes.
- Idempotency: client-generated `Idempotency-Key` header on POSTs that book, pay, or send; server stores the key and replays the result on retry. The single most valuable thing to say in a travel booking context.
- Long-running work: POST returns 202 with a job id; poll `GET /jobs/{id}` or subscribe via SSE; webhooks server to server; AI text streams over SSE.
- Errors: one shape, `{ code, message, field?, details? }`; the UI maps `code` to copy.
- Auth: the server enforces ownership; the UI only hides buttons.
- Caching: ETags and `If-None-Match` for reads; client cache keyed by resource and query.
- Versioning: additive changes only; version the path only for true breaks.
- REST vs GraphQL vs BFF: REST by default for a Django backend; a BFF or GraphQL when many screens need different shapes of the same data.
