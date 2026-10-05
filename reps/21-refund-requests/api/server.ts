import type { Decision, RefundRequest } from "../types";
import { json, wait } from "../../../shared/format";

export const ME = 1;

const REQUESTS: RefundRequest[] = [
  { id: 501, client: "Maya Okafor", booking: "FORA-610233", amount: 1120, reason: "Flight cancelled, hotel non-refundable", status: "pending", requestedAt: "2026-10-02", ownerAdvisorId: 1, note: "" },
  { id: 502, client: "Daniel Reyes", booking: "FORA-610298", amount: 410, reason: "Resort fee charged twice", status: "pending", requestedAt: "2026-10-03", ownerAdvisorId: 1, note: "" },
  { id: 503, client: "Leo Castellano", booking: "FORA-610411", amount: 2300, reason: "Room not as booked", status: "pending", requestedAt: "2026-10-03", ownerAdvisorId: 2, note: "" },
  { id: 504, client: "Hiro Tanaka", booking: "FORA-610472", amount: 890, reason: "Early checkout", status: "pending", requestedAt: "2026-10-04", ownerAdvisorId: 1, note: "" },
  { id: 505, client: "Grace Whitfield", booking: "FORA-610455", amount: 228, reason: "Spa closed", status: "approved", requestedAt: "2026-09-28", ownerAdvisorId: 1, note: "Approved by supplier" },
];

const DECIDED_ELSEWHERE = new Set([504]);

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const { pathname } = new URL(url, "http://advisor.local");
  if (pathname === "/api/refunds") {
    await wait(100, 200);
    return json(REQUESTS);
  }
  const match = pathname.match(/^\/api\/refunds\/(\d+)\/(decision|note)$/);
  if (match && init?.method === "POST") {
    await wait(150, 300);
    const request = REQUESTS.find((r) => r.id === Number(match[1]));
    if (!request) return json({ message: "Not found" }, 404);
    if (request.ownerAdvisorId !== ME) return json({ message: "This request belongs to another advisor" }, 403);
    if (match[2] === "note") {
      const { note } = JSON.parse(String(init.body)) as { note: string };
      request.note = note;
      return json(request);
    }
    if (DECIDED_ELSEWHERE.has(request.id) && request.status === "pending") request.status = "approved";
    if (request.status !== "pending") {
      return json({ message: `Already ${request.status} by the supplier desk` }, 409);
    }
    const { decision } = JSON.parse(String(init.body)) as { decision: Decision };
    request.status = decision;
    return json(request);
  }
  return json({ message: "Not found" }, 404);
}

export function resetServer() {
  REQUESTS.forEach((r) => {
    r.status = r.id === 505 ? "approved" : "pending";
    r.note = r.id === 505 ? "Approved by supplier" : "";
  });
}
