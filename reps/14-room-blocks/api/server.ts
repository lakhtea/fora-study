import type { Room, RoomBlock, Traveler } from "../types";
import { json, wait } from "../../../shared/format";

const BLOCKS: RoomBlock[] = [
  { id: 10, property: "Villa Aurora", checkIn: "2026-11-03", rooms: [
    { id: 1, name: "Master suite", sleeps: 2, assignedTravelerId: null },
    { id: 2, name: "Garden room", sleeps: 2, assignedTravelerId: null },
    { id: 3, name: "Loft", sleeps: 1, assignedTravelerId: null },
  ] },
  { id: 11, property: "Casa Lima", checkIn: "2026-11-05", rooms: [
    { id: 4, name: "Sea view", sleeps: 2, assignedTravelerId: null },
    { id: 5, name: "Courtyard", sleeps: 2, assignedTravelerId: null },
  ] },
];

const TRAVELERS: Traveler[] = [
  { id: 1, name: "Maya Okafor" },
  { id: 2, name: "Tunde Okafor" },
  { id: 3, name: "Ada Okafor" },
  { id: 4, name: "Sofia Reyes" },
  { id: 5, name: "Yuki Tanaka" },
  { id: 6, name: "Noah Reyes" },
];

function allRooms(): Room[] {
  return BLOCKS.flatMap((b) => b.rooms);
}

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const { pathname } = new URL(url, "http://advisor.local");

  if (pathname === "/api/blocks") {
    await wait(100, 200);
    return json(BLOCKS);
  }
  if (pathname === "/api/travelers") {
    await wait(80, 160);
    return json(TRAVELERS);
  }
  const match = pathname.match(/^\/api\/rooms\/(\d+)\/assign$/);
  if (match && init?.method === "POST") {
    await wait(150, 300);
    const room = allRooms().find((r) => r.id === Number(match[1]));
    if (!room) return json({ message: "Room not found" }, 404);
    const { travelerId } = JSON.parse(String(init.body)) as { travelerId: number };
    if (!TRAVELERS.some((t) => t.id === travelerId)) return json({ message: "Traveler not found" }, 404);
    if (room.assignedTravelerId !== null) return json({ message: `${room.name} is already assigned` }, 409);
    if (allRooms().some((r) => r.assignedTravelerId === travelerId)) return json({ message: "Traveler already has a room" }, 409);
    room.assignedTravelerId = travelerId;
    return json(room);
  }
  return json({ message: "Not found" }, 404);
}

export function resetServer() {
  allRooms().forEach((r) => {
    r.assignedTravelerId = null;
  });
}
