import type { ClientSettings, ClientSummary, Traveler, TravelerDirectory } from "../types";
import { apiFetch } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `${what} failed (${res.status})`);
  }
  return res;
}

export async function fetchClients(): Promise<ClientSummary[]> {
  const res = await requireOk(await apiFetch("/api/clients"), "Loading clients");
  return res.json();
}

export async function fetchTravelerDirectory(): Promise<TravelerDirectory> {
  const res = await requireOk(await apiFetch("/api/travelers"), "Loading travelers");
  const travelers: Traveler[] = await res.json();
  return Object.fromEntries(travelers.map((t) => [t.id, t]));
}

export async function fetchSettings(clientId: number): Promise<ClientSettings> {
  const res = await requireOk(await apiFetch(`/api/clients/${clientId}/settings`), "Loading settings");
  return res.json();
}

export async function saveSettings(settings: ClientSettings): Promise<ClientSettings> {
  const res = await requireOk(await apiFetch(`/api/clients/${settings.id}/settings`, { method: "PUT", body: JSON.stringify(settings) }), "Saving");
  return res.json();
}
