// Map-based aggregation over bookings, the kind of transform a commissions screen needs.
// Narrate the data structures: a Map keyed by advisor, one pass, O(n).

export interface Booking {
  id: number;
  advisor: string;
  month: string; // "2026-10"
  status: "paid" | "pending" | "void";
  commission: number;
}

export interface AdvisorTotals {
  advisor: string;
  paid: number;
  pending: number;
  count: number;
}

// 1. Totals per advisor, void bookings excluded from amounts but included in count.
//    Output sorted by paid descending, then advisor A to Z (locale aware).
export function totalsByAdvisor(bookings: readonly Booking[]): AdvisorTotals[] {
  throw new Error("not implemented");
}

// 2. Top N advisors by paid commission in a given month, ties broken by name A to Z.
export function topAdvisors(bookings: readonly Booking[], month: string, n: number): string[] {
  throw new Error("not implemented");
}

// 3. Month buckets: Map from month to paid total, with every month between the earliest and latest present (zeros filled).
export function paidByMonth(bookings: readonly Booking[]): Map<string, number> {
  throw new Error("not implemented");
}
