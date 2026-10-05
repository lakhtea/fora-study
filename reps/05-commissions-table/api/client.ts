import type { Commission, ExportJob, Filters } from "../types";
import { apiFetch } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) throw new Error(`${what} failed (${res.status})`);
  return res;
}

export async function fetchCommissions(): Promise<Commission[]> {
  const res = await requireOk(await apiFetch("/api/commissions"), "Loading commissions");
  return res.json();
}

export async function startExport(filters: Filters, rows: number): Promise<ExportJob> {
  const res = await requireOk(await apiFetch("/api/exports", { method: "POST", body: JSON.stringify({ filters, rows }) }), "Export");
  return res.json();
}
