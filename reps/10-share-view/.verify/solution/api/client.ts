import type { DayItem, ShareView } from "../types";
import { apiFetch } from "./server";

export class ShareUnavailable extends Error {}

export async function fetchShare(token: string): Promise<ShareView> {
  const res = await apiFetch(`/api/share/${token}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new ShareUnavailable(body?.message ?? `This link can't be opened (${res.status})`);
  }
  return res.json();
}

export async function fetchDayItems(token: string, dayIndex: number): Promise<DayItem[]> {
  const res = await apiFetch(`/api/share/${token}/days/${dayIndex}`);
  if (!res.ok) throw new Error(`Loading day failed (${res.status})`);
  return res.json();
}
