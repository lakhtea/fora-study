import type { Payout, PayoutSettings } from "../types";
import { apiFetch } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) throw new Error(`${what} failed (${res.status})`);
  return res;
}

export async function fetchPayouts(): Promise<Payout[]> {
  const res = await requireOk(await apiFetch("/api/payouts"), "Loading payouts");
  return res.json();
}

export async function fetchSettings(): Promise<PayoutSettings> {
  const res = await requireOk(await apiFetch("/api/payouts/settings"), "Loading settings");
  return res.json();
}
