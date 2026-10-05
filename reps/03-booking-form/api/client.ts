import type { Confirmation, Quote, Room, RoomType, Traveler } from "../types";
import { apiFetch } from "./server";

export async function fetchRoomTypes(): Promise<RoomType[]> {
  const res = await apiFetch("/api/room-types");
  if (!res.ok) throw new Error(`Loading room types failed (${res.status})`);
  return res.json();
}

export async function fetchQuote(checkIn: string, checkOut: string, rooms: Room[]): Promise<Quote | null> {
  const params = new URLSearchParams({ checkIn, checkOut, rooms: JSON.stringify(rooms) });
  const res = await apiFetch(`/api/quote?${params}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createBooking(traveler: Traveler, checkIn: string, checkOut: string, rooms: Room[], total: number): Promise<Confirmation> {
  const res = await apiFetch("/api/bookings", { method: "POST", body: JSON.stringify({ traveler, checkIn, checkOut, rooms, total }) });
  if (!res.ok) throw new Error(`Booking failed (${res.status})`);
  return res.json();
}
