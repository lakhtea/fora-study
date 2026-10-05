# Answer key: rep 17 (Import clients). Do not open until the timer ends.

Three bugs, one per category, independent. Verified in a scripted run (`npm run verify 17`, `npm run solution 17`). Classes: D3 (logic), T2 (TypeScript lie), L2 (React mechanics). Tickets are in shuffled order.

## 1. Logic: defaults spread over the data (IMP-130)

**Where:** `components/csv.ts`:
```ts
const DEFAULTS = { status: "prospect", source: "csv" };
return { ...record, ...DEFAULTS } as ImportRow;
```
**Layer:** data transformation. A merge where the later spread wins, with the wrong thing last.

**Why it breaks:** Object spread is last-writer-wins. `record` carries the CSV's `status`; `DEFAULTS` comes after it, so `status: "prospect"` overwrites every row. The `as ImportRow` cast hides that `record` is only a `Partial`. The blank cell row is "right" by accident.

**Fix:** don't merge; map each field explicitly and apply the default only where the cell is empty or invalid:
```ts
function toStatus(value) { const n = (value ?? "").trim().toLowerCase(); return STATUSES.includes(n) ? n : "prospect"; }
return { rowId: index + 1, name: record.name ?? "", email: record.email ?? "", city: record.city ?? "", status: toStatus(record.status), source: "csv" };
```
**Looks right but isn't:**
- Swapping the spreads, `{ ...DEFAULTS, ...record }`: Priya and Elena are right, and the blank cell now yields `status: ""`, which isn't a valid status and renders the select on its first option while the state says empty. The acceptance test checks the blank row for exactly this.
- Keeping the merge and deleting empty keys from `record` first: works, with the cast still lying about the shape.
- Validating on the server: the server should validate too; the preview is wrong before anything is sent.

**Fastest way to find it:** every status in the preview reads "prospect" while the CSV plainly doesn't. Read `parseCsv` for the merge order.

**The tell:** a field that's right only when the source left it blank. A defaults merge in the wrong order.

**Say it like this:** "Defaults are spread after the parsed record, so they overwrite the CSV. Reordering fixes the overwrite and leaves empty cells as empty strings; the real fix is explicit field mapping with validation, so a blank or bad status becomes the default and nothing else changes."

**Production angle:** a schema (`z.enum` with a default) for parsed rows; never `as` a `Partial` into a full type.

## 2. TypeScript lie: reading a wrapper that isn't there (IMP-134)

**Where:** `api/client.ts`:
```ts
const body = await res.json();
return body.data;
```
and `App.tsx`: `useState<ExistingClient[] | undefined>()`, `(existing ?? []).map(...)`, and the "Loading your clients" branch on `existing === undefined`.

**Layer:** data at the API boundary. The client assumed a `{ data: [...] }` wrapper; the backend sends `{ clients, total }`.

**Why it breaks:** `res.json()` is `any`, so `body.data` is `any`, and returning it as `ExistingClient[]` compiles. At runtime it's `undefined`. `setExisting(undefined)` keeps the state in its initial shape, so the header stays on "Loading your clients" forever, and `(existing ?? []).map(...)` builds an empty set of emails, so no one is flagged and the import count includes everyone. The `?? []` written for the loading state now also covers "the client misread the response."

**Fix:** read the shape the server sends and refuse anything else:
```ts
const body = (await res.json()) as { clients: ExistingClient[]; total: number };
if (!Array.isArray(body.clients)) throw new Error("Unexpected clients response");
return body.clients;
```
**Looks right but isn't:**
- `body.data ?? body.clients ?? []`: works for both shapes and for no shape; a wrong response quietly becomes "no clients" again.
- Treating `undefined` as an empty list in the component: the header stops saying Loading and the flags are still missing.
- Asking the backend to wrap in `data`: the server's shape is documented; the client misread it.

**Fastest way to find it:** DevTools: `existing` is `undefined` after the request completes. Or the Network response body, which has `clients`, not `data`.

**The tell:** a loading state that never resolves plus a feature that silently finds nothing. The response was read with the wrong key and the type didn't notice.

**Say it like this:** "The client returns `body.data` from a response that has `clients`, and `any` lets `undefined` pass as an array. The loading branch and the `?? []` then treat the misread as 'no clients.' Read the right key, validate that it's an array, and throw if not."

**Production angle:** a Zod schema per endpoint, so a shape change fails loudly in the client function.

## 3. React mechanics: rows keyed by a field that isn't unique (IMP-139)

**Where:** `components/PreviewTable.tsx`: `<tr key={row.email}>` and `statusEdits[row.email]`; `App.tsx` stores edits in `Record<string, ClientStatus>` by email.

**Layer:** identity. React keys and the edits map both assume one row per email.

**Why it breaks:** Two Sams share an email. React warns about the duplicate key and can confuse the two rows during reconciliation; the edits map is keyed by the same email, so changing one row's status writes `statusEdits["sam@..."]`, which both rows read. The second ingredient is the data model, not just the key: fixing the key alone leaves the shared edit.

**Fix:** give every parsed row its own id, key and edit by it, and surface the duplicate instead of hiding it:
```ts
rowId: index + 1   // in parseCsv
<tr key={row.rowId}>; statusEdits[row.rowId]
const duplicateRowIds = ids of any row whose email was already seen; flag "duplicate in paste"; exclude from newRows
```
**Looks right but isn't:**
- `key={index}`: the warning goes away and both rows still share the edit, because the map is still keyed by email.
- Deduping the rows at parse time: the user pasted two rows and now sees one with no explanation; a different name on the second row is silently dropped.
- `key={`${row.email}-${index}`}`: unique, and the edits map is still shared.

**Fastest way to find it:** the console warning names the key. DevTools: `statusEdits` has one entry after editing one of two rows that both read it.

**The tell:** editing one list item changes another, with a duplicate-key warning. The identity is a field that repeats.

**Say it like this:** "Rows are keyed and edited by email, and the paste has two rows with the same email, so React can't tell them apart and the edits map can't either. Assign a row id at parse time, key and edit by it, and flag the duplicate so the user can decide."

**Production angle:** stable ids for anything editable; validation that reports duplicates rather than resolving them silently.

## Not bugs (in case you went looking)

- `SAMPLE` is prefilled so the page is usable without a CSV on hand; it includes the duplicate and the blank cell on purpose.
- `importClients` posts only `newRows`; in the fix that also excludes in-paste duplicates.
- `imported` in `server.ts` is server state for the tests.
- The header's `existing.length` after the fix reads 3, matching the server's `total`.
- `e.target.value as ClientStatus` on the preview's select: the options are the three literals, so the cast can't be wrong. Compare with the `as ImportRow` in `parseCsv`, which can.

## Generator QA
- Page renders on load with no console errors: PASS (the duplicate-key warning appears only after Parse, which is the ticket)
- `npm run typecheck` passes: PASS
- Tickets reproduce by their steps, every time: PASS (`npm run verify 17`)
- Surface patch and root fix explained for each: PASS (the spread-reorder patch fails the blank-cell check)
- Independent, no accidental extra bugs: PASS (`npm run solution 17`)
- No comments or names point at a bug: PASS
- Tickets contain no file names or code vocabulary: PASS
- Not-bugs section has real decoys: PASS (five)
- Classes: D3, T2, L2: PASS
