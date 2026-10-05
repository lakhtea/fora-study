import type { BookingRequest, FieldError, RoomType } from "../types";
import { json, wait } from "../../../shared/format";

const ROOM_TYPES: RoomType[] = [
  { code: "standard", name: "Standard King", maxGuests: 2, price: 180 },
  { code: "deluxe", name: "Deluxe Terrace", maxGuests: 3, price: 320 },
  { code: "suite", name: "Garden Suite", maxGuests: 4, price: 290 },
];

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const { pathname } = new URL(url, "http://advisor.local");

  if (pathname === "/api/room-types") {
    await wait(100, 200);
    return json(ROOM_TYPES);
  }

  if (pathname === "/api/bookings" && init?.method === "POST") {
    await wait(300, 500);
    const body = JSON.parse(String(init.body)) as BookingRequest;
    const errors: FieldError[] = [];
    if (/test/i.test(body.traveler.email)) errors.push({ field: "traveler.email", message: "Test addresses are not accepted by the supplier" });
    for (const [i, room] of body.rooms.entries()) {
      const type = ROOM_TYPES.find((t) => t.code === room.type);
      if (type && room.guests > type.maxGuests) errors.push({ field: `rooms.${i}.guests`, message: `${type.name} sleeps at most ${type.maxGuests}` });
    }
    if (errors.length) return json({ message: "Validation failed", errors }, 422);
    return json({ reference: `FORA-${Math.floor(100000 + Math.random() * 900000)}` }, 201);
  }

  return json({ message: "Not found" }, 404);
}
