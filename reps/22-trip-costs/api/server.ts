import { json, wait } from "../../../shared/format";

interface LineRecord {
  id: number;
  category: "hotel" | "activities" | "transfers" | "fees";
  label: string;
  amount?: number;
  amountCents?: number;
}

const TRIP = {
  tripId: 7,
  title: "Lisbon long weekend",
  supplierCurrency: "EUR" as const,
  lines: [
    { id: 1, category: "hotel", label: "Four Seasons, 7 nights", amount: 3920 },
    { id: 2, category: "activities", label: "Alfama food walk", amount: 95 },
    { id: 3, category: "activities", label: "Doge's Palace tour", amount: 85 },
    { id: 4, category: "transfers", label: "Airport transfers", amount: 150 },
    { id: 5, category: "fees", label: "Booking fee", amountCents: 12500 },
  ] as LineRecord[],
};

export async function apiFetch(url: string): Promise<Response> {
  const { pathname } = new URL(url, "http://advisor.local");
  if (pathname === "/api/trips/7/costs") {
    await wait(120, 240);
    return json(TRIP);
  }
  if (pathname === "/api/fx") {
    await wait(60, 120);
    return json({ pair: "EURUSD", rate: "1.0800", asOf: "2026-10-05T13:00:00Z" });
  }
  return json({ message: "Not found" }, 404);
}
