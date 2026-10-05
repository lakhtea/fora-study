import type { Commission } from "../types";
import { json, wait } from "../../../shared/format";

const COMMISSIONS: Commission[] = [
  { id: 1, reference: "FORA-610233", client: "Maya Okafor", supplier: "Four Seasons Lisbon", travelDate: "2026-09-18T15:00:00Z", status: "paid", amount: 448 },
  { id: 2, reference: "FORA-610298", client: "Daniel Reyes", supplier: "Scottsdale Princess", travelDate: "2026-09-27T16:00:00Z", status: "paid", amount: 312 },
  { id: 3, reference: "FORA-610411", client: "Leo Castellano", supplier: "Les Sources de Caudalie", travelDate: "2026-10-01T09:00:00Z", status: "paid", amount: 664 },
  { id: 4, reference: "FORA-610455", client: "Grace Whitfield", supplier: "Enchantment Resort", travelDate: "2026-10-04T15:00:00Z", status: "pending", amount: 228 },
  { id: 5, reference: "FORA-610472", client: "Hiro Tanaka", supplier: "Aman Kyoto", travelDate: "2026-10-09T15:00:00Z", status: "pending", amount: 1120 },
  { id: 6, reference: "FORA-610490", client: "Marcus Bennett", supplier: "Hotel Condesa DF", travelDate: "2026-10-09T15:00:00Z", status: "void", amount: 152 },
  { id: 7, reference: "FORA-610503", client: "Samuel Adeyemi", supplier: "Singita Sabi Sand", travelDate: "2026-10-12T14:00:00Z", status: "pending", amount: 1475 },
  { id: 8, reference: "FORA-610518", client: "Fatima El-Amin", supplier: "Four Seasons Bosphorus", travelDate: "2026-10-15T14:30:00Z", status: "paid", amount: 408 },
  { id: 9, reference: "FORA-610534", client: "Chloe Dubois", supplier: "Le Bristol Paris", travelDate: "2026-10-22T15:00:00Z", status: "paid", amount: 590 },
  { id: 10, reference: "FORA-610560", client: "Elena Marchetti", supplier: "Belmond Hotel Caruso", travelDate: "2026-11-02T15:00:00Z", status: "pending", amount: 735 },
  { id: 11, reference: "FORA-610571", client: "Anika Sharma", supplier: "Bairro Alto Hotel", travelDate: "2026-11-10T15:00:00Z", status: "pending", amount: 265 },
  { id: 12, reference: "FORA-610588", client: "Tom Lindqvist", supplier: "Four Seasons Whistler", travelDate: "2026-11-21T16:00:00Z", status: "void", amount: 330 },
];

let nextJobId = 1;

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const { pathname } = new URL(url, "http://advisor.local");

  if (pathname === "/api/commissions") {
    await wait(150, 350);
    return json(COMMISSIONS);
  }

  if (pathname === "/api/exports" && init?.method === "POST") {
    await wait(100, 200);
    const body = JSON.parse(String(init.body)) as { rows: number };
    return json({ id: nextJobId++, rows: body.rows }, 202);
  }

  return json({ message: "Not found" }, 404);
}
