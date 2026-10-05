import type { Advisor, Period, RankedRow } from "../types";
import { json, wait } from "../../../shared/format";

const ADVISORS: Advisor[] = [
  { id: 1, name: "Maya Okafor" },
  { id: 2, name: "Daniel Reyes" },
  { id: 3, name: "Leo Castellano" },
  { id: 4, name: "Grace Whitfield" },
  { id: 5, name: "Samuel Adeyemi" },
  { id: 6, name: "Fatima El-Amin" },
  { id: 7, name: "Priya Natarajan" },
];

const BOARDS: Record<Period, RankedRow[]> = {
  month: [
    { advisorId: 1, name: "Maya Okafor", position: 1, bookings: 14, revenue: 182400, movement: 2 },
    { advisorId: 3, name: "Leo Castellano", position: 2, bookings: 11, revenue: 171900, movement: -1 },
    { advisorId: 2, name: "Daniel Reyes", position: 3, bookings: 12, revenue: 140200, movement: -1 },
    { advisorId: 5, name: "Samuel Adeyemi", position: 4, bookings: 9, revenue: 121500, movement: 0 },
    { advisorId: 4, name: "Grace Whitfield", position: 5, bookings: 8, revenue: 96300, movement: 1 },
    { advisorId: 6, name: "Fatima El-Amin", position: 6, bookings: 6, revenue: 74800, movement: -1 },
  ],
  quarter: [
    { advisorId: 3, name: "Leo Castellano", position: 1, bookings: 31, revenue: 498000, movement: 0 },
    { advisorId: 1, name: "Maya Okafor", position: 2, bookings: 29, revenue: 455100, movement: 1 },
    { advisorId: 2, name: "Daniel Reyes", position: 3, bookings: 30, revenue: 402900, movement: -1 },
    { advisorId: 4, name: "Grace Whitfield", position: 4, bookings: 22, revenue: 301200, movement: 2 },
    { advisorId: 5, name: "Samuel Adeyemi", position: 5, bookings: 24, revenue: 288000, movement: -1 },
    { advisorId: 6, name: "Fatima El-Amin", position: 6, bookings: 17, revenue: 210400, movement: -1 },
  ],
};

export async function apiFetch(url: string): Promise<Response> {
  const { pathname, searchParams } = new URL(url, "http://advisor.local");
  if (pathname === "/api/advisors") {
    await wait(60, 120);
    return json(ADVISORS);
  }
  if (pathname === "/api/leaderboard") {
    await wait(100, 200);
    const period = (searchParams.get("period") ?? "month") as Period;
    return json(BOARDS[period]);
  }
  return json({ message: "Not found" }, 404);
}
