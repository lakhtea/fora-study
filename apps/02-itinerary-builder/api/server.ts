import type { Itinerary } from "../types";
import { json, wait } from "../../../shared/format";

let ITINERARY: Itinerary = {
  id: 7,
  title: "Lisbon long weekend",
  days: ["2026-11-03", "2026-11-04", "2026-11-05"],
  items: [
    { id: "a1", dayIndex: 0, kind: "transfer", title: "Airport transfer", price: 75 },
    { id: "a2", dayIndex: 0, kind: "hotel", title: "Four Seasons Lisbon", price: 560 },
    { id: "a3", dayIndex: 1, kind: "activity", title: "Alfama Food Walk", price: 95 },
  ],
  version: 1,
};

export const saveLog: { at: number; version: number; itemCount: number }[] = [];

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const { pathname } = new URL(url, "http://advisor.local");

  if (pathname === "/api/itineraries/7" && (!init || !init.method || init.method === "GET")) {
    await wait(120, 250);
    return json(ITINERARY);
  }

  if (pathname === "/api/itineraries/7" && init?.method === "PUT") {
    await wait(250, 450);
    const body = JSON.parse(String(init.body)) as Itinerary;
    if (body.version !== ITINERARY.version) {
      return json({ message: `Stale version ${body.version}, server has ${ITINERARY.version}`, current: ITINERARY }, 409);
    }
    ITINERARY = { ...body, version: ITINERARY.version + 1 };
    saveLog.push({ at: Date.now(), version: ITINERARY.version, itemCount: ITINERARY.items.length });
    return json(ITINERARY);
  }

  return json({ message: "Not found" }, 404);
}

export function resetServer() {
  ITINERARY = { ...ITINERARY, version: 1, items: ITINERARY.items.slice(0, 3) };
  saveLog.length = 0;
}
