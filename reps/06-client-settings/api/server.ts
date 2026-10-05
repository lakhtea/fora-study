import type { ClientSettings, ClientSummary, Traveler } from "../types";
import { json, wait } from "../../../shared/format";

const CLIENTS: ClientSummary[] = [
  { id: 101, name: "Maya Okafor" },
  { id: 102, name: "Daniel Reyes" },
  { id: 106, name: "Hiro Tanaka" },
];

const SETTINGS: Record<number, ClientSettings> = {
  101: { id: 101, name: "Maya Okafor", phone: "+1 718 555 0142", currency: "USD", preferences: { newsletter: true, whatsapp: false, priceAlerts: true }, travelerIds: [901, 902] },
  102: { id: 102, name: "Daniel Reyes", phone: "+1 512 555 0199", currency: "USD", preferences: { newsletter: false, whatsapp: true, priceAlerts: true }, travelerIds: [903] },
  106: { id: 106, name: "Hiro Tanaka", phone: "+81 3 5555 0121", currency: "USD", preferences: { newsletter: true, whatsapp: true, priceAlerts: false }, travelerIds: [904, 905] },
};

const TRAVELERS: (Traveler & { archived?: boolean })[] = [
  { id: 901, name: "Tunde Okafor", relationship: "Spouse" },
  { id: 902, name: "Ada Okafor", relationship: "Daughter" },
  { id: 903, name: "Sofia Reyes", relationship: "Spouse" },
  { id: 904, name: "Yuki Tanaka", relationship: "Spouse" },
  { id: 905, name: "Kenji Tanaka", relationship: "Father", archived: true },
  { id: 906, name: "Noah Reyes", relationship: "Son" },
];

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const { pathname } = new URL(url, "http://advisor.local");

  if (pathname === "/api/clients") {
    await wait(100, 200);
    return json(CLIENTS);
  }

  if (pathname === "/api/travelers") {
    await wait(100, 200);
    return json(TRAVELERS.filter((t) => !t.archived).map(({ archived, ...traveler }) => traveler));
  }

  const match = pathname.match(/^\/api\/clients\/(\d+)\/settings$/);
  if (match) {
    const id = Number(match[1]);
    const current = SETTINGS[id];
    if (!current) return json({ message: "Not found" }, 404);
    if (init?.method === "PUT") {
      await wait(200, 400);
      const body = JSON.parse(String(init.body)) as ClientSettings;
      if (!/^[+\d][\d\s-]*$/.test(body.phone)) {
        return json({ message: "Phone may only contain digits, spaces, dashes, and a leading +" }, 422);
      }
      SETTINGS[id] = { ...body, id };
      return json(SETTINGS[id]);
    }
    await wait(120, 250);
    return json(current);
  }

  return json({ message: "Not found" }, 404);
}
