# Grading an API design rep (score each 0 to 3)

1. Framing: requirements written as two lists, scale and auth asked, scope stated before designing.
2. Model: entities with ids and ownership, state machine drawn for lifecycles.
3. Endpoints: a complete table, conventions named, non-CRUD actions handled as sub-resources.
4. Payloads: three written out, one error shape, validation rules stated.
5. Hard parts: at least two covered with a mechanism, not a buzzword (409 with version; idempotency key stored with result; cursor on an indexed key; 202 and job resource; backoff with jitter and a breaker).
6. Frontend consumption: cache keys and invalidation, optimistic update with rollback, loading, error, and empty states.
7. Communication: said the plan first, restated the interviewer's numbers before using them, named trade-offs out loud, closed with a summary and a v1 cut.

18 or more of 21 is interview-ready. Anything under 2 on item 5 or 7 is the thing to drill next.
