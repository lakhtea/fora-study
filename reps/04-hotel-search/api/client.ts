import type { Hotel, HotelDetail, SearchFilters } from "../types";
import { apiFetch } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) throw new Error(`${what} failed (${res.status})`);
  return res;
}

export async function searchHotels(
  filters: SearchFilters,
): Promise<{ results: Hotel[]; total: number }> {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.city) params.set("city", filters.city);
  if (filters.minStars) params.set("minStars", String(filters.minStars));
  const res = await requireOk(
    await apiFetch(`/api/hotels?${params}`),
    "Searching hotels",
  );
  const page = (await res.json()) as { results: Hotel[]; total: number };
  return {
    results: page.results.map((h) => ({ ...h, rate: Number(h.rate) })),
    total: page.total,
  };
}

export async function fetchHotelDetail(id: number): Promise<HotelDetail> {
  const res = await requireOk(
    await apiFetch(`/api/hotels/${id}`),
    "Loading hotel",
  );
  return res.json();
}
