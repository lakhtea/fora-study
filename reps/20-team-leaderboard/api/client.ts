import type { Advisor, Period, RankedRow } from "../types";
import { apiFetch } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) throw new Error(`${what} failed (${res.status})`);
  return res;
}

export async function fetchAdvisors(): Promise<Advisor[]> {
  const res = await requireOk(await apiFetch("/api/advisors"), "Loading advisors");
  return res.json();
}

export async function fetchLeaderboard(period: Period): Promise<RankedRow[]> {
  const res = await requireOk(await apiFetch(`/api/leaderboard?period=${period}`), "Loading leaderboard");
  return res.json();
}
