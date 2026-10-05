import type { Trip } from "../types";
import { apiFetch } from "./server";

export async function searchTrips(query: string): Promise<Trip[]> {
  const params = query ? `?q=${encodeURIComponent(query)}` : "";
  const res = await apiFetch(`/api/trips${params}`);
  if (!res.ok) throw new Error(`Loading trips failed (${res.status})`);
  return res.json();
}
