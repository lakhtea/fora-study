# Model answer: supplier search and discovery

**Frame.** Advisors search by text, city, dates, stars, map bounds; favorite suppliers; save searches. Rates come from a slow, flaky feed. Non-functional: search results under a second even when the feed is down; favorites and saved searches never lost; results for an old query never overwrite a new one. Scale: tens of thousands of suppliers, search is read-heavy. Auth: advisor session; favorites and saved searches are per advisor.

**Model.** Supplier (id, name, type, city, lat, lng, stars, amenities). RateSnapshot (supplier_id, date, nightly, currency, as_of, source). Favorite (advisor_id, supplier_id, created_at). SavedSearch (id, advisor_id, name, params JSON, last_run_at). Search is not a resource; it's a query over suppliers joined to the latest snapshot.

**Endpoints.**

| Method and path | Purpose | Notes |
| --- | --- | --- |
| GET /suppliers?q=&city=&stars=&bbox=&check_in=&check_out=&cursor=&limit= | Search | cursor; returns `rates_as_of` per row |
| GET /suppliers/{id} | Detail | amenities, policies, latest snapshot |
| GET /suppliers/{id}/rates?check_in=&check_out= | Fresh rates | may return cached with `stale: true` and `as_of` |
| POST /favorites | Favorite | body `{ supplier_id }`; idempotent (unique advisor, supplier) |
| DELETE /favorites/{supplier_id} | Unfavorite | 204 |
| GET /favorites | List | small list, no pagination needed |
| POST /saved-searches | Save | params stored as sent |
| GET /saved-searches | List | |
| POST /saved-searches/{id}/run | Rerun | returns the same shape as /suppliers |

**Payloads.** Search response: `{ results: [{ id, name, city, stars, rate: { nightly, currency, as_of, stale } }], next_cursor, applied: { city, stars } }`. Rates: `{ nightly, currency, as_of, stale, source }`. Error shape shared.

**Hard parts.** The feed: never in the search path. A refresh worker keeps RateSnapshot warm for popular suppliers and date ranges; search reads snapshots; the detail page can request fresh rates, with a 2-second timeout falling back to the snapshot marked `stale`. Retries with exponential backoff and jitter in the worker, a circuit breaker that stops calling the feed after N failures and serves snapshots, and a TTL so stale data is visibly dated. Out-of-order responses in the UI: cancel the previous search (AbortController) and ignore results whose request started before the latest. Map bounds: index on lat and lng (or a geohash), bounded page size, cursor encodes the sort key and the last id. Favorites: idempotent POST with a unique constraint so double clicks don't duplicate.

**Frontend consumption.** TanStack Query keyed by the full filter tuple; debounce the text input only; a race-safe effect or the library's cancellation; optimistic favorite toggle with rollback; the "rates as of" timestamp shown next to prices so stale data is honest; saved searches hydrate the filter form.

**Close.** v1: snapshot-backed search, no live rates on the detail page. Instrument: search p95, feed timeout rate, breaker state, stale-rate percentage shown to users.
