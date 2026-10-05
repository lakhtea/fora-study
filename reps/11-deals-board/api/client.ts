import type { Deal } from "../types";
import { apiFetch } from "./server";

export async function fetchDeals(): Promise<Deal[]> {
  const res = await apiFetch("/api/deals");
  if (!res.ok) throw new Error(`Loading deals failed (${res.status})`);
  return res.json();
}
