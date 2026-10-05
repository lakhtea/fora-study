# Model answer: itinerary builder with an AI writing assistant

**Frame.** Users: advisors (desktop, many edits per session), clients (read-only link, mobile). Functional: create and edit itineraries with ordered days and items; autosave; publish a share link; AI drafts for item descriptions. Non-functional: edits feel instant; no lost work on refresh; two tabs or two people must not silently overwrite each other; AI latency is seconds, so it must not block editing. Scale question: thousands of advisors, tens of itineraries each, items in the dozens. Auth: advisor session; the server checks ownership of every itinerary.

**Model.** Itinerary (id, advisor_id, client_id, title, status: draft | published | archived, version, updated_at). Day (id, itinerary_id, date, position). Item (id, day_id, type, position, payload JSON, supplier_ref?, description). Share (itinerary_id, token, expires_at). AiSuggestion (id, item_id, prompt, text, status: pending | ready | accepted | discarded). State machine on Itinerary: draft to published (snapshot taken), published to draft (new edits), either to archived.

**Endpoints.**

| Method and path | Purpose | Notes |
| --- | --- | --- |
| GET /itineraries?client_id=&status=&cursor= | List | cursor, sort by updated_at |
| POST /itineraries | Create draft | 201, full object |
| GET /itineraries/{id} | Load editor | days and items included; ETag |
| PATCH /itineraries/{id} | Title, dates, status | carries version; 409 on mismatch |
| POST /itineraries/{id}/items | Add item | day_id, position; returns server id |
| PATCH /items/{id} | Edit payload or move | autosave target; position handled server-side |
| DELETE /items/{id} | Remove | 204; soft delete for undo |
| POST /itineraries/{id}/publish | Snapshot and share | idempotent; returns share URL |
| GET /share/{token} | Client view | public, read-only, cached |
| POST /items/{id}/ai-suggestions | Draft text | 202 plus SSE stream; accept or discard as PATCH |

**Payloads.** `PATCH /items/{id}`: `{ version: 12, payload: { title, notes }, position?: 3 }` responds with the item and `version: 13`. `GET /itineraries/{id}` responds with `{ id, title, version, days: [{ id, date, items: [...] }] }`. Error shape everywhere: `{ code: "stale_version", message, field?, details?: { current } }`.

**Hard parts.** Concurrency: every write carries the version it read; the server compares and returns 409 with the current object; the client merges non-conflicting fields and prompts on real conflicts. Autosave: a debounced save queue keyed by item id so rapid edits collapse into one PATCH per item; in-flight saves tracked so the "Saved" indicator is honest. AI: POST returns 202 with a suggestion id and an SSE stream URL; tokens stream into a pending block; accept writes the text to the item via PATCH; the suggestion record is the audit trail. Publish is idempotent (same snapshot if called twice) and the share token is revocable. Permissions: ownership checked on every path; the share endpoint is the only unauthenticated read and exposes a snapshot, not live data.

**Frontend consumption.** Load once into TanStack Query under `["itinerary", id]`; local editor state per block; optimistic reorder with rollback on 409; "Saved" driven by the queue; the AI block renders streamed text with accept and discard; on refresh, the query refetches and the queue is empty by design because saves are per edit, not per session.

**Close.** v1 cut: single-user editing with version checks (no real-time), publish as a snapshot, AI drafts without streaming (poll a job). Instrument: PATCH latency, 409 rate, AI time to first token, publish count.
