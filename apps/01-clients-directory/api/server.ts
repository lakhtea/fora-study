import type { Client, ClientDetail } from "../types";
import { json, wait } from "../../../shared/format";

const CLIENTS: ClientDetail[] = [
  { id: 101, firstName: "Maya", lastName: "Okafor", email: "maya.okafor@example.com", city: "Brooklyn", status: "active", lifetimeValue: 48200, createdAt: "2023-03-14", phone: "+1 718 555 0142", notes: ["Anniversary in October"], upcomingTrips: [{ destination: "Lisbon", startDate: "2026-11-03" }] },
  { id: 102, firstName: "Daniel", lastName: "Reyes", email: "d.reyes@example.com", city: "Austin", status: "active", lifetimeValue: 91350, createdAt: "2022-11-02", phone: "+1 512 555 0199", notes: ["Travels with two kids"], upcomingTrips: [{ destination: "Scottsdale", startDate: "2026-10-22" }] },
  { id: 103, firstName: "Priya", lastName: "Natarajan", email: "priya.n@example.com", city: "Chicago", status: "prospect", lifetimeValue: 0, createdAt: "2026-09-01", phone: "+1 312 555 0117", notes: [], upcomingTrips: [] },
  { id: 104, firstName: "Tom", lastName: "Lindqvist", email: "tom.l@example.com", city: "Seattle", status: "inactive", lifetimeValue: 17600, createdAt: "2021-05-22", phone: "+1 206 555 0163", notes: [], upcomingTrips: [] },
  { id: 105, firstName: "Grace", lastName: "Whitfield", email: "grace.w@example.com", city: "Denver", status: "active", lifetimeValue: 26900, createdAt: "2024-01-09", phone: "+1 303 555 0188", notes: ["Vegetarian"], upcomingTrips: [{ destination: "Sedona", startDate: "2026-12-05" }] },
  { id: 106, firstName: "Hiro", lastName: "Tanaka", email: "hiro.tanaka@example.com", city: "San Francisco", status: "active", lifetimeValue: 63400, createdAt: "2022-07-30", phone: "+1 415 555 0121", notes: ["Books far in advance"], upcomingTrips: [{ destination: "Kyoto", startDate: "2027-03-28" }] },
  { id: 107, firstName: "Elena", lastName: "Marchetti", email: "elena.m@example.com", city: "Miami", status: "prospect", lifetimeValue: 0, createdAt: "2026-08-20", phone: "+1 305 555 0176", notes: [], upcomingTrips: [] },
  { id: 108, firstName: "Samuel", lastName: "Adeyemi", email: "sam.adeyemi@example.com", city: "Atlanta", status: "active", lifetimeValue: 38750, createdAt: "2023-10-17", phone: "+1 404 555 0134", notes: ["Birthday in May"], upcomingTrips: [{ destination: "Cape Town", startDate: "2027-01-14" }] },
  { id: 109, firstName: "Chloe", lastName: "Dubois", email: "chloe.d@example.com", city: "Boston", status: "inactive", lifetimeValue: 54100, createdAt: "2020-02-03", phone: "+1 617 555 0150", notes: [], upcomingTrips: [] },
  { id: 110, firstName: "Marcus", lastName: "Bennett", email: "m.bennett@example.com", city: "Brooklyn", status: "active", lifetimeValue: 12300, createdAt: "2025-03-11", phone: "+1 347 555 0108", notes: [], upcomingTrips: [{ destination: "Mexico City", startDate: "2026-10-09" }] },
  { id: 111, firstName: "Anika", lastName: "Sharma", email: "anika.s@example.com", city: "Houston", status: "prospect", lifetimeValue: 0, createdAt: "2026-09-18", phone: "+1 713 555 0192", notes: ["Asked about Portugal"], upcomingTrips: [] },
  { id: 112, firstName: "Leo", lastName: "Castellano", email: "leo.c@example.com", city: "Chicago", status: "active", lifetimeValue: 77900, createdAt: "2021-09-05", phone: "+1 773 555 0145", notes: ["VIP"], upcomingTrips: [{ destination: "Bordeaux", startDate: "2026-10-30" }] },
];

export async function apiFetch(url: string): Promise<Response> {
  const { pathname, searchParams } = new URL(url, "http://advisor.local");

  if (pathname === "/api/clients") {
    const term = (searchParams.get("search") ?? "").trim().toLowerCase();
    const status = searchParams.get("status") ?? "all";
    const rows: Client[] = CLIENTS.filter((c) => (status === "all" || c.status === status) && (!term || `${c.firstName} ${c.lastName} ${c.email} ${c.city}`.toLowerCase().includes(term))).map(
      ({ phone, notes, upcomingTrips, ...summary }) => summary
    );
    await wait(100 + rows.length * 40);
    return json(rows);
  }

  const match = pathname.match(/^\/api\/clients\/(\d+)$/);
  if (match) {
    await wait(150, 350);
    const client = CLIENTS.find((c) => c.id === Number(match[1]));
    return client ? json(client) : json({ message: "Not found" }, 404);
  }

  return json({ message: "Not found" }, 404);
}
