import type { Rate } from "../types";
import { json, wait } from "../../../shared/format";

const HOTELS = [
  ["Bairro Alto Hotel", "Lisbon"], ["Four Seasons Ritz", "Lisbon"], ["Memmo Alfama", "Lisbon"], ["The Lumiares", "Lisbon"],
  ["Hotel Lutetia", "Paris"], ["Hotel des Grands Boulevards", "Paris"], ["Le Pigalle", "Paris"], ["Hotel Providence", "Paris"],
  ["Aman Tokyo", "Tokyo"], ["Trunk Hotel", "Tokyo"], ["Park Hyatt Tokyo", "Tokyo"], ["Hoshinoya Tokyo", "Tokyo"],
  ["Hotel Arts", "Barcelona"], ["Casa Bonay", "Barcelona"], ["Soho House", "Barcelona"], ["Cotton House", "Barcelona"],
] as const;
const ROOM_TYPES = ["Standard", "Deluxe", "Suite"] as const;

function seeded(n: number): number {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export const RATES: Rate[] = [];
let id = 1;
for (let h = 0; h < HOTELS.length; h++) {
  for (let r = 0; r < ROOM_TYPES.length; r++) {
    for (let d = 0; d < 105; d++) {
      const date = new Date(Date.UTC(2026, 10, 1 + d)).toISOString().slice(0, 10);
      const base = 120 + h * 45 + r * 90;
      RATES.push({ id: id++, hotel: HOTELS[h][0], city: HOTELS[h][1], roomType: ROOM_TYPES[r], date, nightly: Math.round(base + seeded(id) * 160), available: seeded(id * 7) > 0.15 });
    }
  }
}

export async function apiFetch(url: string): Promise<Response> {
  const { pathname } = new URL(url, "http://advisor.local");
  if (pathname === "/api/rates") {
    await wait(200, 300);
    return json(RATES);
  }
  return json({ message: "Not found" }, 404);
}
