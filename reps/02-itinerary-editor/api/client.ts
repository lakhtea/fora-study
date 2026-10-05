import type { Itinerary, Supplier, SupplierCategory } from "../types";
import { apiFetch } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `${what} failed (${res.status})`);
  }
  return res;
}

export async function fetchItinerary(id: number): Promise<Itinerary> {
  const res = await requireOk(await apiFetch(`/api/itineraries/${id}`), "Loading itinerary");
  return res.json();
}

export async function fetchSuppliers(category: SupplierCategory): Promise<Supplier[]> {
  const res = await requireOk(await apiFetch(`/api/suppliers?category=${category}`), "Loading suppliers");
  return res.json();
}
