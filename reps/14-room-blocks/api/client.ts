import type { Room, RoomBlock, Traveler } from "../types";
import { apiFetch } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `${what} failed (${res.status})`);
  }
  return res;
}

export async function fetchBlocks(): Promise<RoomBlock[]> {
  const res = await requireOk(await apiFetch("/api/blocks"), "Loading room blocks");
  return res.json();
}

export async function fetchTravelers(): Promise<Traveler[]> {
  const res = await requireOk(await apiFetch("/api/travelers"), "Loading travelers");
  return res.json();
}

export async function assignRoom(roomId: number, travelerId: number): Promise<Room> {
  const res = await requireOk(await apiFetch(`/api/rooms/${roomId}/assign`, { method: "POST", body: JSON.stringify({ travelerId }) }), "Assigning");
  return res.json();
}
