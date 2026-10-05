import type { Household, Traveler } from "../types";
import { apiFetch } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) throw new Error(`${what} failed (${res.status})`);
  return res;
}

export async function fetchHousehold(clientId: number): Promise<Household> {
  const res = await requireOk(await apiFetch(`/api/households/${clientId}`), "Loading household");
  return res.json();
}

export async function saveNotes(travelerId: number, notes: string): Promise<Traveler> {
  const res = await requireOk(await apiFetch(`/api/travelers/${travelerId}/notes`, { method: "PUT", body: JSON.stringify({ notes }) }), "Saving notes");
  return res.json();
}
