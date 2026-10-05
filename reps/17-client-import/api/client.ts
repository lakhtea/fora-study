import type { ExistingClient, ImportRow } from "../types";
import { apiFetch } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) throw new Error(`${what} failed (${res.status})`);
  return res;
}

export async function fetchExistingClients(): Promise<ExistingClient[]> {
  const res = await requireOk(await apiFetch("/api/clients"), "Loading clients");
  const body = await res.json();
  return body.data;
}

export async function importClients(rows: ImportRow[]): Promise<number> {
  const res = await requireOk(await apiFetch("/api/clients/import", { method: "POST", body: JSON.stringify(rows) }), "Importing");
  const body = (await res.json()) as { imported: number };
  return body.imported;
}
