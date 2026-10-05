import type { DayCell, MonthAvailability } from "../types";
import { json, wait } from "../../../shared/format";

function seeded(n: number): number {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function monthCells(month: string): DayCell[] {
  const [y, m] = month.split("-").map(Number);
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: DayCell[] = [];
  for (let d = 1; d <= days; d++) {
    const seed = y * 10000 + m * 100 + d;
    cells.push({ date: `${month}-${String(d).padStart(2, "0")}`, available: seeded(seed) > 0.2, rate: 320 + Math.round(seeded(seed * 7) * 180) });
  }
  return cells;
}

export async function apiFetch(url: string): Promise<Response> {
  const { pathname, searchParams } = new URL(url, "http://advisor.local");
  if (pathname === "/api/availability") {
    const month = searchParams.get("month") ?? "2026-11";
    await wait(120, 240);
    const body: MonthAvailability = { month, hotel: "Bairro Alto Hotel", cells: monthCells(month) };
    return json(body);
  }
  return json({ message: "Not found" }, 404);
}
