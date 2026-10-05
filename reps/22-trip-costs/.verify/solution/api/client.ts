import type { CostLine, TripCosts } from "../types";
import { apiFetch } from "./server";

interface LineWire extends Omit<CostLine, "amount"> {
  amount?: number;
  amountCents?: number;
}

export async function fetchTripCosts(tripId: number): Promise<TripCosts> {
  const res = await apiFetch(`/api/trips/${tripId}/costs`);
  if (!res.ok) throw new Error(`Loading costs failed (${res.status})`);
  const body = (await res.json()) as Omit<TripCosts, "lines"> & { lines: LineWire[] };
  return {
    ...body,
    lines: body.lines.map((line) => ({
      id: line.id,
      category: line.category,
      label: line.label,
      amount: line.amountCents !== undefined ? line.amountCents / 100 : line.amount ?? 0,
    })),
  };
}

export async function fetchRate(): Promise<number> {
  const res = await apiFetch("/api/fx");
  if (!res.ok) throw new Error(`Loading rate failed (${res.status})`);
  const body = (await res.json()) as { rate: string | number };
  const rate = Number(body.rate);
  if (!Number.isFinite(rate)) throw new Error("Unexpected rate payload");
  return rate;
}
