import type { SupplierContacts } from "../types";
import { apiFetch } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) throw new Error(`${what} failed (${res.status})`);
  return res;
}

export async function fetchContacts(): Promise<SupplierContacts> {
  const res = await requireOk(await apiFetch("/api/suppliers/501/contacts"), "Loading contacts");
  return res.json();
}

export async function saveContacts(data: SupplierContacts): Promise<SupplierContacts> {
  const res = await requireOk(await apiFetch("/api/suppliers/501/contacts", { method: "PUT", body: JSON.stringify(data) }), "Saving contacts");
  return res.json();
}
