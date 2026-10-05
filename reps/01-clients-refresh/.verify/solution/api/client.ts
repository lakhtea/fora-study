import type { Client, ClientDetail, ClientQuery, ClientRow, Trip } from "../types";
import { apiFetch } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `${what} failed (${res.status})`);
  }
  return res;
}

function toClient(row: ClientRow): Client {
  const { lastBooking, ...summary } = row;
  return {
    ...summary,
    lastBookingDestination: lastBooking?.destination ?? null,
    lastBookingNights: lastBooking?.nights ?? null,
  };
}

export async function fetchClients(query: ClientQuery): Promise<Client[]> {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status !== "all") params.set("status", query.status);
  const suffix = params.toString() ? `?${params}` : "";
  const res = await requireOk(await apiFetch(`/api/clients${suffix}`), "Loading clients");
  const rows: ClientRow[] = await res.json();
  return rows.map(toClient);
}

export async function fetchClientDetail(id: number): Promise<ClientDetail> {
  const res = await requireOk(await apiFetch(`/api/clients/${id}`), "Loading client");
  const raw = (await res.json()) as Omit<ClientDetail, "id"> & { id: string | number };
  return { ...raw, id: Number(raw.id) };
}

export async function fetchUpcomingTrips(): Promise<Trip[]> {
  const res = await requireOk(await apiFetch("/api/trips"), "Loading trips");
  return res.json();
}
