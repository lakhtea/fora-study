import type { DayItem, ShareView } from "../types";
import { apiFetch } from "./server";

export async function fetchShare(token: string): Promise<ShareView | null> {
  const res = await apiFetch(`/api/share/${token}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchDayItems(token: string, dayIndex: number): Promise<DayItem[]> {
  const res = await apiFetch(`/api/share/${token}/days/${dayIndex}`);
  if (!res.ok) throw new Error(`Loading day failed (${res.status})`);
  return res.json();
}
