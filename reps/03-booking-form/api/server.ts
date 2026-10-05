import type { Confirmation, Quote, Room, RoomType } from "../types";
import { json, wait } from "../../../shared/format";

const ROOM_TYPES: RoomType[] = [
  { code: "standard", name: "Standard King", maxGuests: 2, price: 180 },
  { code: "deluxe", name: "Deluxe Terrace", maxGuests: 3, price: 320 },
  { code: "suite", name: "Garden Suite", maxGuests: 4, price: 290 },
  { code: "penthouse", name: "Penthouse", maxGuests: 6, price: 900 },
];

function nightsBetween(checkIn: string, checkOut: string): number {
  const [y1, m1, d1] = checkIn.split("-").map(Number);
  const [y2, m2, d2] = checkOut.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const { pathname, searchParams } = new URL(url, "http://advisor.local");

  if (pathname === "/api/room-types") {
    await wait(100, 250);
    return json(ROOM_TYPES);
  }

  if (pathname === "/api/quote") {
    await wait(150, 350);
    const checkIn = searchParams.get("checkIn") ?? "";
    const checkOut = searchParams.get("checkOut") ?? "";
    const rooms = JSON.parse(searchParams.get("rooms") ?? "[]") as Room[];
    const nights = nightsBetween(checkIn, checkOut);
    if (!(nights > 0)) return json({ message: "Check-out must be after check-in" }, 422);
    if (nights > 14) return json({ message: "Stays over 14 nights need a manual quote from the supplier desk" }, 422);
    const nightlyTotal = rooms.reduce((sum, room) => sum + (ROOM_TYPES.find((t) => t.code === room.type)?.price ?? 0), 0);
    const subtotal = nightlyTotal * nights;
    const taxes = Math.round(subtotal * 0.12 * 100) / 100;
    const quote: Quote = { nights, nightlyTotal, taxes, total: Math.round((subtotal + taxes) * 100) / 100 };
    return json(quote);
  }

  if (pathname === "/api/bookings" && init?.method === "POST") {
    await wait(200, 400);
    const body = JSON.parse(String(init.body)) as { total: number };
    const confirmation: Confirmation = { reference: `FORA-${Math.floor(100000 + Math.random() * 900000)}`, total: body.total };
    return json(confirmation, 201);
  }

  return json({ message: "Not found" }, 404);
}
