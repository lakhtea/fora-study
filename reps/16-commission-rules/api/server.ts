import type { Quarter, Rule, SampleBooking, SampleSet, Tier } from "../types";
import { json, wait } from "../../../shared/format";

const RULES: Rule[] = [
  { id: 1, tier: "preferred", label: "Preferred partners", rate: 12, enabled: true },
  { id: 2, tier: "standard", label: "Standard suppliers", rate: 10, enabled: true },
];

const SUPPLIERS: [string, Tier][] = [
  ["Four Seasons Lisbon", "preferred"], ["Aman Kyoto", "preferred"], ["Belmond Caruso", "preferred"],
  ["Scottsdale Princess", "standard"], ["Hotel Lutetia", "standard"], ["Trunk Hotel", "standard"], ["Le Pigalle", "standard"],
  ["Bairro Alto Hotel", "boutique"], ["Memmo Alfama", "boutique"],
];

function seeded(n: number): number {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function sample(quarter: Quarter): SampleBooking[] {
  const offset = quarter === "Q3" ? 0 : 50000;
  const rows: SampleBooking[] = [];
  for (let i = 0; i < 2000; i++) {
    const [supplier, tier] = SUPPLIERS[Math.floor(seeded(i + offset) * SUPPLIERS.length)];
    rows.push({ id: i + 1 + offset, supplier, tier, gross: Math.round(800 + seeded(i * 3 + offset) * 6000) });
  }
  return rows;
}

export async function apiFetch(url: string): Promise<Response> {
  const { pathname, searchParams } = new URL(url, "http://advisor.local");
  if (pathname === "/api/commission-rules") {
    await wait(80, 160);
    return json(RULES);
  }
  if (pathname === "/api/sample-bookings") {
    await wait(150, 300);
    const quarter = (searchParams.get("quarter") ?? "Q3") as Quarter;
    const set: SampleSet = { quarter, bookings: sample(quarter) };
    return json(set);
  }
  return json({ message: "Not found" }, 404);
}
