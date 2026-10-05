import type { Payout, PayoutSettings } from "../types";
import { json, wait } from "../../../shared/format";

const PAYOUTS: Payout[] = [
  { id: 7001, month: "2026-07", amount: 1200, status: "paid", reviewed: true, bookings: 4 },
  { id: 7002, month: "2026-08", amount: 980, status: "paid", reviewed: true, bookings: 3 },
  { id: 7003, month: "2026-09", amount: 1100, status: "pending", reviewed: false, bookings: 5 },
  { id: 7004, month: "2026-10", amount: 550, status: "pending", reviewed: false, bookings: 2 },
  { id: 7005, month: "2026-11", amount: 300, status: "held", reviewed: false, bookings: 1 },
];

const SETTINGS: PayoutSettings = { threshold: 500, defaultThreshold: 500, schedule: "monthly" };

export async function apiFetch(url: string): Promise<Response> {
  const { pathname } = new URL(url, "http://advisor.local");

  if (pathname === "/api/payouts") {
    await wait(120, 260);
    return json(PAYOUTS);
  }

  if (pathname === "/api/payouts/settings") {
    await wait(80, 160);
    return json(SETTINGS);
  }

  return json({ message: "Not found" }, 404);
}
