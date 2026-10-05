import type { Deal } from "../types";
import { apiFetch } from "./server";

interface DealWire extends Omit<Deal, "validUntil"> {
  validUntil: { date: string; tz: string };
}

export async function fetchDeals(): Promise<Deal[]> {
  const res = await apiFetch("/api/deals");
  if (!res.ok) throw new Error(`Loading deals failed (${res.status})`);
  const rows = (await res.json()) as DealWire[];
  return rows.map((row) => ({ ...row, validUntil: row.validUntil.date }));
}
