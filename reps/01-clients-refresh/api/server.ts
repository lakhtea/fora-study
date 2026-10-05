import type { ClientDetail, ClientRow, Trip } from "../types";
import { json, wait } from "../../../shared/format";

const CLIENTS: ClientRow[] = [
  { id: 101, firstName: "Maya", lastName: "Okafor", email: "maya.okafor@example.com", city: "Brooklyn", status: "active", createdAt: "2023-03-14", lastTripAt: "2026-08-02", lifetimeValue: 48200, lastBooking: { bookingId: 7701, destination: "Lisbon", nights: 7, createdAt: "2026-07-21" } },
  { id: 102, firstName: "Daniel", lastName: "Reyes", email: "d.reyes@example.com", city: "Austin", status: "active", createdAt: "2022-11-02", lastTripAt: "2026-06-19", lifetimeValue: 91350, lastBooking: { bookingId: 7688, destination: "Scottsdale", nights: 4, createdAt: "2026-05-28" } },
  { id: 103, firstName: "Priya", lastName: "Natarajan", email: "priya.n@example.com", city: "Chicago", status: "prospect", createdAt: "2026-09-01", lastTripAt: null, lifetimeValue: 0, lastBooking: null },
  { id: 104, firstName: "Tom", lastName: "Lindqvist", email: "tom.l@example.com", city: "Seattle", status: "inactive", createdAt: "2021-05-22", lastTripAt: "2024-02-11", lifetimeValue: 17600, lastBooking: { bookingId: 6120, destination: "Whistler", nights: 5, createdAt: "2024-01-15" } },
  { id: 105, firstName: "Grace", lastName: "Whitfield", email: "grace.w@example.com", city: "Denver", status: "active", createdAt: "2024-01-09", lastTripAt: "2026-09-14", lifetimeValue: 26900, lastBooking: { bookingId: 7712, destination: "Sedona", nights: 4, createdAt: "2026-08-30" } },
  { id: 106, firstName: "Hiro", lastName: "Tanaka", email: "hiro.tanaka@example.com", city: "San Francisco", status: "active", createdAt: "2022-07-30", lastTripAt: "2026-04-05", lifetimeValue: 63400, lastBooking: { bookingId: 7604, destination: "Kyoto", nights: 11, createdAt: "2026-03-02" } },
  { id: 107, firstName: "Elena", lastName: "Marchetti", email: "elena.m@example.com", city: "Miami", status: "prospect", createdAt: "2026-08-20", lastTripAt: null, lifetimeValue: 0, lastBooking: null },
  { id: 108, firstName: "Samuel", lastName: "Adeyemi", email: "sam.adeyemi@example.com", city: "Atlanta", status: "active", createdAt: "2023-10-17", lastTripAt: "2026-07-28", lifetimeValue: 38750, lastBooking: { bookingId: 7719, destination: "Cape Town", nights: 11, createdAt: "2026-09-05" } },
  { id: 109, firstName: "Chloe", lastName: "Dubois", email: "chloe.d@example.com", city: "Boston", status: "inactive", createdAt: "2020-02-03", lastTripAt: "2023-12-20", lifetimeValue: 54100, lastBooking: { bookingId: 5890, destination: "Paris", nights: 6, createdAt: "2023-11-30" } },
  { id: 110, firstName: "Marcus", lastName: "Bennett", email: "m.bennett@example.com", city: "Brooklyn", status: "active", createdAt: "2025-03-11", lastTripAt: "2026-09-21", lifetimeValue: 12300, lastBooking: { bookingId: 7731, destination: "Mexico City", nights: 4, createdAt: "2026-09-12" } },
  { id: 111, firstName: "Anika", lastName: "Sharma", email: "anika.s@example.com", city: "Houston", status: "prospect", createdAt: "2026-09-18", lastTripAt: null, lifetimeValue: 0, lastBooking: null },
  { id: 112, firstName: "Leo", lastName: "Castellano", email: "leo.c@example.com", city: "Chicago", status: "active", createdAt: "2021-09-05", lastTripAt: "2026-05-30", lifetimeValue: 77900, lastBooking: { bookingId: 7694, destination: "Bordeaux", nights: 7, createdAt: "2026-06-10" } },
  { id: 113, firstName: "Fatima", lastName: "El-Amin", email: "fatima.e@example.com", city: "Philadelphia", status: "active", createdAt: "2024-06-25", lastTripAt: "2026-08-16", lifetimeValue: 21400, lastBooking: { bookingId: 7708, destination: "Istanbul", nights: 7, createdAt: "2026-08-01" } },
];

const DETAILS: Record<number, Pick<ClientDetail, "phone" | "preferences" | "notes">> = {
  101: { phone: "+1 718 555 0142", preferences: ["Boutique hotels", "Aisle seat"], notes: ["Anniversary in October", "Prefers email over phone"] },
  102: { phone: "+1 512 555 0199", preferences: ["Golf resorts", "Late checkout"], notes: ["Travels with two kids"] },
  103: { phone: "+1 312 555 0117", preferences: [], notes: ["Referred by Maya Okafor"] },
  104: { phone: "+1 206 555 0163", preferences: ["Ski", "Direct flights"], notes: [] },
  105: { phone: "+1 303 555 0188", preferences: ["Wellness", "Quiet rooms"], notes: ["Vegetarian"] },
  106: { phone: "+1 415 555 0121", preferences: ["Ryokan stays", "Rail passes"], notes: ["Books far in advance"] },
  107: { phone: "+1 305 555 0176", preferences: [], notes: [] },
  108: { phone: "+1 404 555 0134", preferences: ["Safari", "Business class"], notes: ["Birthday in May"] },
  109: { phone: "+1 617 555 0150", preferences: ["Museums"], notes: ["Moved to Boston in 2023"] },
  110: { phone: "+1 347 555 0108", preferences: ["Budget friendly"], notes: ["First trip booked Sep 2026"] },
  111: { phone: "+1 713 555 0192", preferences: [], notes: ["Asked about Portugal"] },
  112: { phone: "+1 773 555 0145", preferences: ["Wine regions", "Private transfers"], notes: ["VIP"] },
  113: { phone: "+1 215 555 0127", preferences: ["Halal dining"], notes: [] },
};

const TRIPS: Trip[] = [
  { id: 9001, clientId: 101, destination: "Lisbon", startDate: "2026-11-03", endDate: "2026-11-10", total: 6400 },
  { id: 9002, clientId: 102, destination: "Scottsdale", startDate: "2026-10-22", endDate: "2026-10-26", total: 3900 },
  { id: 9003, clientId: 105, destination: "Sedona", startDate: "2026-12-05", endDate: "2026-12-09", total: 2850 },
  { id: 9004, clientId: 106, destination: "Kyoto", startDate: "2027-03-28", endDate: "2027-04-08", total: 11200 },
  { id: 9005, clientId: 108, destination: "Cape Town", startDate: "2027-01-14", endDate: "2027-01-25", total: 14750 },
  { id: 9006, clientId: 112, destination: "Bordeaux", startDate: "2026-10-30", endDate: "2026-11-06", total: 8300 },
  { id: 9007, clientId: 113, destination: "Istanbul", startDate: "2026-11-20", endDate: "2026-11-27", total: 5100 },
  { id: 9008, clientId: 110, destination: "Mexico City", startDate: "2026-10-09", endDate: "2026-10-13", total: 1900 },
];

export async function apiFetch(url: string): Promise<Response> {
  const { pathname, searchParams } = new URL(url, "http://advisor.local");

  if (pathname === "/api/clients") {
    await wait(150, 600);
    const term = (searchParams.get("search") ?? "").trim().toLowerCase();
    const status = searchParams.get("status") ?? "all";
    const rows = CLIENTS.filter((c) => {
      const matchesStatus = status === "all" || c.status === status;
      const haystack = `${c.firstName} ${c.lastName} ${c.email} ${c.city}`.toLowerCase();
      return matchesStatus && (term === "" || haystack.includes(term));
    });
    return json(rows);
  }

  const detailMatch = pathname.match(/^\/api\/clients\/(\d+)$/);
  if (detailMatch) {
    await wait(150, 600);
    const id = Number(detailMatch[1]);
    const client = CLIENTS.find((c) => c.id === id);
    if (!client) {
      return json({ message: `Client ${id} not found` }, 404);
    }
    const { lastBooking, ...summary } = client;
    const extra = DETAILS[id] ?? { phone: "", preferences: [], notes: [] };
    return json({ ...summary, ...extra, id: String(client.id) });
  }

  if (pathname === "/api/trips") {
    await wait(100, 300);
    return json(TRIPS);
  }

  return json({ message: "Not found" }, 404);
}
