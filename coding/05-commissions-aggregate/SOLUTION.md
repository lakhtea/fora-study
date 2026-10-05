# Solution notes: commissions aggregate

```ts
export function totalsByAdvisor(bookings: readonly Booking[]): AdvisorTotals[] {
  const byAdvisor = new Map<string, AdvisorTotals>();
  for (const b of bookings) {
    let row = byAdvisor.get(b.advisor);
    if (!row) byAdvisor.set(b.advisor, (row = { advisor: b.advisor, paid: 0, pending: 0, count: 0 }));
    row.count++;
    if (b.status === "paid") row.paid += b.commission;
    if (b.status === "pending") row.pending += b.commission;
  }
  return [...byAdvisor.values()].sort((a, b) => b.paid - a.paid || a.advisor.localeCompare(b.advisor, undefined, { sensitivity: "base" }));
}

export function topAdvisors(bookings: readonly Booking[], month: string, n: number): string[] {
  return totalsByAdvisor(bookings.filter((b) => b.month === month && b.status === "paid"))
    .filter((t) => t.paid > 0)
    .slice(0, n)
    .map((t) => t.advisor);
}

export function paidByMonth(bookings: readonly Booking[]): Map<string, number> {
  const out = new Map<string, number>();
  if (bookings.length === 0) return out;
  const months = bookings.map((b) => b.month).sort();
  let [y, m] = months[0].split("-").map(Number);
  const last = months[months.length - 1];
  for (;;) {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    out.set(key, 0);
    if (key === last) break;
    m++;
    if (m > 12) { m = 1; y++; }
  }
  for (const b of bookings) if (b.status === "paid") out.set(b.month, (out.get(b.month) ?? 0) + b.commission);
  return out;
}
```
Say: "One Map, one pass, O(n); the sort is O(k log k) over advisors. Comparator chain: primary descending, `||` to the name tiebreak with `localeCompare`. Map preserves insertion order, which is why the month loop fills in order."
