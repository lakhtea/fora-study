import type { OnboardingRecord, Requirements } from "../types";
import { apiFetch } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) throw new Error(`${what} failed (${res.status})`);
  return res;
}

export async function fetchOnboarding(id: number): Promise<OnboardingRecord> {
  const res = await requireOk(await apiFetch(`/api/onboarding/${id}`), "Loading onboarding");
  return res.json();
}

export async function fetchRequirements(): Promise<Requirements> {
  const res = await requireOk(await apiFetch("/api/onboarding/requirements"), "Loading requirements");
  return res.json();
}
