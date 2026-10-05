import type { MonthAvailability } from "../types";
import { apiFetch } from "./server";

export async function fetchAvailability(month: string): Promise<MonthAvailability> {
  const res = await apiFetch(`/api/availability?month=${month}`);
  if (!res.ok) throw new Error(`Loading availability failed (${res.status})`);
  return res.json();
}
