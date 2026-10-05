# App 05: Report jobs (60 minutes)

**Skill:** async workflows. A 202 + polling contract, polling that stops when it should, transient failures with retry and backoff, cancellation, optimistic removal with rollback, and an error boundary. The same shapes you'll describe in the API design hour.

Run `npm run app 5`. Build `App.tsx` plus components and `api/client.ts`. Backend: `api/server.ts` (readable, not changeable). When done: `npm run accept 5`.

## Spec (from the PM)

> Finance generates payout and commission reports that take a few seconds. Advisors should kick one off, watch it progress, and download it when it's done, without the page getting stuck if the status check hiccups.

## Acceptance behaviors

1. A form with a kind select (`aria-label="Report kind"`: payouts, commissions) and a month input (`aria-label="Month"`, type month) and a `Generate` button. Submitting POSTs `/api/reports`, which answers 202 with an id. The new job appears in the list immediately as "queued".
2. The job list (`aria-label="Jobs"`) shows one `listitem` per job with kind, month, a status badge (`queued`, `running`, `done`, `failed`), and a progress bar (`role="progressbar"` with `aria-valuenow`) while running.
3. Each running or queued job is polled at `/api/reports/:id` every 500 ms until it's done or failed, then polling for that job stops (the acceptance test counts requests after completion). Polling a job that has been removed from the list stops too.
4. A 503 from the status endpoint is retried with backoff (at least 500 ms, then 1000 ms) up to 3 times before the job shows `failed` with "Status unavailable". The server returns two 503s per session on purpose; the job must still reach done.
5. A done job shows a `Download` link with the server's `downloadUrl`. A failed job shows the server's error text.
6. A `Cancel` button on queued and running jobs removes the job optimistically from the list, DELETEs it, and restores it with an alert if the DELETE fails (you can simulate by cancelling twice quickly; the second DELETE returns 404).
7. Wrap the list in an error boundary: if rendering a job throws, the page shows "Something went wrong with the job list" and a `Retry` button instead of a blank page.

## Narrate as you build

Say the contract out loud: POST returns 202 and an id, the client polls, the server is the source of truth for status. Explain why polling lives in one effect keyed by the set of active ids, with cleanup, and why backoff needs jitter in production.

## Time budget

0-5 plan, 5-15 form and list, 15-30 polling with cleanup, 30-40 retry and backoff, 40-50 cancel with rollback, 50-56 error boundary, 56-60 recap.
