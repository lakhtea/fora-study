import { json, wait } from "../../../shared/format";

interface DealRecord {
  id: number;
  supplier: string;
  city: string;
  category: "hotel" | "cruise" | "activity";
  headline: string;
  discountPercent: number;
  validUntil: { date: string; tz: string };
  perks: string[];
}

const DEALS: DealRecord[] = [
  { id: 1, supplier: "Four Seasons Lisbon", city: "Lisbon", category: "hotel", headline: "Third night free", discountPercent: 33, validUntil: { date: "2026-11-30", tz: "Europe/Lisbon" }, perks: ["Breakfast", "Late checkout"] },
  { id: 2, supplier: "Belmond Hotel Caruso", city: "Ravello", category: "hotel", headline: "Suite upgrade on arrival", discountPercent: 15, validUntil: { date: "2026-10-31", tz: "Europe/Rome" }, perks: ["Upgrade", "Spa credit"] },
  { id: 3, supplier: "Silversea", city: "Lisbon", category: "cruise", headline: "Door-to-door included", discountPercent: 20, validUntil: { date: "2026-12-15", tz: "UTC" }, perks: ["Transfers", "Shore excursions"] },
  { id: 4, supplier: "Aman Kyoto", city: "Kyoto", category: "hotel", headline: "Stay 4 pay 3", discountPercent: 25, validUntil: { date: "2027-01-31", tz: "Asia/Tokyo" }, perks: ["Breakfast", "Onsen access"] },
  { id: 5, supplier: "Alfama Food Walk", city: "Lisbon", category: "activity", headline: "Private group rate", discountPercent: 10, validUntil: { date: "2026-11-10", tz: "Europe/Lisbon" }, perks: ["Private guide"] },
  { id: 6, supplier: "Singita Sabi Sand", city: "Sabi Sand", category: "hotel", headline: "Complimentary flights from Joburg", discountPercent: 40, validUntil: { date: "2026-12-20", tz: "Africa/Johannesburg" }, perks: ["Flights", "Game drives"] },
  { id: 7, supplier: "Explora Journeys", city: "Barcelona", category: "cruise", headline: "Onboard credit", discountPercent: 12, validUntil: { date: "2026-11-20", tz: "UTC" }, perks: ["$500 onboard credit"] },
  { id: 8, supplier: "Tsukiji Sushi Class", city: "Tokyo", category: "activity", headline: "Two for one on weekdays", discountPercent: 50, validUntil: { date: "2026-10-28", tz: "Asia/Tokyo" }, perks: ["Sake tasting"] },
];

export async function apiFetch(url: string): Promise<Response> {
  const { pathname } = new URL(url, "http://advisor.local");
  if (pathname === "/api/deals") {
    await wait(120, 260);
    return json(DEALS);
  }
  return json({ message: "Not found" }, 404);
}
