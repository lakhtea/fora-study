import type { Decision, RefundRequest } from "../types";
import { apiFetch } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `${what} failed (${res.status})`);
  }
  return res;
}

export async function fetchRefunds(): Promise<RefundRequest[]> {
  const res = await requireOk(await apiFetch("/api/refunds"), "Loading refunds");
  return res.json();
}

export async function decideRefund(id: number, decision: Decision): Promise<RefundRequest | null> {
  const res = await apiFetch(`/api/refunds/${id}/decision`, { method: "POST", body: JSON.stringify({ decision }) });
  if (res.status === 403) return null;
  await requireOk(res, "Deciding");
  return res.json();
}

export async function saveNote(id: number, note: string): Promise<RefundRequest | null> {
  const res = await apiFetch(`/api/refunds/${id}/note`, { method: "POST", body: JSON.stringify({ note }) });
  if (res.status === 403) return null;
  await requireOk(res, "Saving note");
  return res.json();
}
