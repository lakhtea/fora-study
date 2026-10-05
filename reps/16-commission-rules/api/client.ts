import type { Quarter, Rule, SampleSet } from "../types";
import { apiFetch } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) throw new Error(`${what} failed (${res.status})`);
  return res;
}

export async function fetchRules(): Promise<Rule[]> {
  const res = await requireOk(await apiFetch("/api/commission-rules"), "Loading rules");
  return res.json();
}

export async function fetchSample(quarter: Quarter): Promise<SampleSet> {
  const res = await requireOk(await apiFetch(`/api/sample-bookings?quarter=${quarter}`), "Loading sample");
  return res.json();
}
