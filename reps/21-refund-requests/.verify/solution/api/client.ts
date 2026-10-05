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

export class RefundError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

async function post(path: string, body: unknown, what: string): Promise<RefundRequest> {
  const res = await apiFetch(path, { method: "POST", body: JSON.stringify(body) });
  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new RefundError(payload?.message ?? `${what} failed (${res.status})`, res.status);
  }
  return res.json();
}

export function decideRefund(id: number, decision: Decision): Promise<RefundRequest> {
  return post(`/api/refunds/${id}/decision`, { decision }, "Deciding");
}

export function saveNote(id: number, note: string): Promise<RefundRequest> {
  return post(`/api/refunds/${id}/note`, { note }, "Saving note");
}
