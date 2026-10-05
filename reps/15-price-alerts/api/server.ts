import type { PriceAlert } from "../types";
import { json, wait } from "../../../shared/format";

interface BookingRecord {
  reference: string;
  hotel: string;
  client: string;
  checkIn: string;
  paidNightly: number;
}

const BOOKINGS: BookingRecord[] = [
  { reference: "FORA-610233", hotel: "Four Seasons Lisbon", client: "Maya Okafor", checkIn: "2026-11-03", paidNightly: 560 },
  { reference: "FORA-610298", hotel: "Scottsdale Princess", client: "Daniel Reyes", checkIn: "2026-10-22", paidNightly: 410 },
  { reference: "FORA-610472", hotel: "Aman Kyoto", client: "Hiro Tanaka", checkIn: "2027-03-28", paidNightly: 1450 },
  { reference: "FORA-610518", hotel: "Four Seasons Bosphorus", client: "Fatima El-Amin", checkIn: "2026-11-20", paidNightly: 480 },
];

let ALERTS: PriceAlert[] = [
  { id: 1, reference: "FORA-610298", hotel: "Scottsdale Princess", client: "Daniel Reyes", paidNightly: 410, currentNightly: 385, lastChecked: "2026-10-04", checks: 12, status: "active" },
  { id: 2, reference: "FORA-610472", hotel: "Aman Kyoto", client: "Hiro Tanaka", paidNightly: 1450, currentNightly: 1450, lastChecked: "2026-10-04", checks: 3, status: "paused" },
];
let nextId = 3;

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const { pathname } = new URL(url, "http://advisor.local");

  if (pathname === "/api/bookings") {
    await wait(80, 160);
    return json(BOOKINGS);
  }
  if (pathname === "/api/price-alerts" && (!init?.method || init.method === "GET")) {
    await wait(100, 200);
    return json(ALERTS);
  }
  if (pathname === "/api/price-alerts" && init?.method === "POST") {
    await wait(150, 300);
    const { reference } = JSON.parse(String(init.body)) as { reference: string };
    const booking = BOOKINGS.find((b) => b.reference === reference.trim().toUpperCase());
    if (!booking) return json({ message: `No booking ${reference}` }, 404);
    if (ALERTS.some((a) => a.reference === booking.reference)) return json({ message: "Already subscribed" }, 409);
    const alert: PriceAlert = { id: nextId++, reference: booking.reference, hotel: booking.hotel, client: booking.client, paidNightly: booking.paidNightly, currentNightly: booking.paidNightly, lastChecked: "2026-10-05", checks: 0, status: "active" };
    ALERTS = [...ALERTS, alert];
    return json(alert, 201);
  }
  return json({ message: "Not found" }, 404);
}

export function resetServer() {
  ALERTS = ALERTS.filter((a) => a.id <= 2);
  nextId = 3;
}
