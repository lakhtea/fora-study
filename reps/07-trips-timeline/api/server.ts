import type { Trip } from "../types";
import { json, wait } from "../../../shared/format";

const TRIPS: Trip[] = [
  { id: 1, clientName: "Maya Okafor", destination: "Lisbon", startDate: "2026-11-03", endDate: "2026-11-10", status: "upcoming", total: 6400, hotel: "Four Seasons Lisbon" },
  { id: 2, clientName: "Daniel Reyes", destination: "Scottsdale", startDate: "2026-10-22", endDate: "2026-10-26", status: "upcoming", total: 3900, hotel: "Scottsdale Princess" },
  { id: 3, clientName: "Grace Whitfield", destination: "Sedona", startDate: "2026-12-05", endDate: "2026-12-09", status: "upcoming", total: 2850, hotel: "Enchantment Resort" },
  { id: 4, clientName: "Hiro Tanaka", destination: "Kyoto", startDate: "2027-03-28", endDate: "2027-04-08", status: "upcoming", total: 11200, hotel: "Aman Kyoto" },
  { id: 5, clientName: "Samuel Adeyemi", destination: "Cape Town", startDate: "2027-01-14", endDate: "2027-01-25", status: "upcoming", total: 14750, hotel: "Singita Sabi Sand" },
  { id: 6, clientName: "Leo Castellano", destination: "Bordeaux", startDate: "2026-10-30", endDate: "2026-11-06", status: "upcoming", total: 8300, hotel: "Les Sources de Caudalie" },
  { id: 7, clientName: "Fatima El-Amin", destination: "Istanbul", startDate: "2026-10-01", endDate: "2026-10-08", status: "in-progress", total: 5100, hotel: "Four Seasons Bosphorus" },
  { id: 8, clientName: "Marcus Bennett", destination: "Mexico City", startDate: "2026-09-09", endDate: "2026-09-13", status: "completed", total: 1900, hotel: "Hotel Condesa DF" },
  { id: 9, clientName: "Chloe Dubois", destination: "Paris", startDate: "2026-08-22", endDate: "2026-08-29", status: "completed", total: 7200, hotel: "Le Bristol Paris" },
  { id: 10, clientName: "Elena Marchetti", destination: "Amalfi", startDate: "2026-11-02", endDate: "2026-11-09", status: "upcoming", total: 9100, hotel: "Belmond Hotel Caruso" },
];

export let requestsServed = 0;

export async function apiFetch(url: string): Promise<Response> {
  const { pathname, searchParams } = new URL(url, "http://advisor.local");

  if (pathname === "/api/trips") {
    requestsServed++;
    const q = (searchParams.get("q") ?? "").trim().toLowerCase();
    const rows = TRIPS.filter((t) => !q || `${t.clientName} ${t.destination} ${t.hotel}`.toLowerCase().includes(q));
    await wait(120, 260);
    return json(rows);
  }

  return json({ message: "Not found" }, 404);
}
