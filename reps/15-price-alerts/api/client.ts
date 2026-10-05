import type { Booking, PriceAlert } from "../types";
import { apiFetch } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `${what} failed (${res.status})`);
  }
  return res;
}

export async function fetchBookings(): Promise<Booking[]> {
  const res = await requireOk(await apiFetch("/api/bookings"), "Loading bookings");
  return res.json();
}

export async function fetchAlerts(): Promise<PriceAlert[]> {
  const res = await requireOk(await apiFetch("/api/price-alerts"), "Loading alerts");
  return res.json();
}

export async function createAlert(reference: string): Promise<PriceAlert> {
  const res = await requireOk(await apiFetch("/api/price-alerts", { method: "POST", body: JSON.stringify({ reference }) }), "Subscribing");
  return res.json();
}
