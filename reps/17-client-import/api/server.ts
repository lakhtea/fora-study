import type { ExistingClient, ImportRow } from "../types";
import { json, wait } from "../../../shared/format";

const CLIENTS: ExistingClient[] = [
  { id: 101, name: "Maya Okafor", email: "maya.okafor@example.com" },
  { id: 102, name: "Daniel Reyes", email: "d.reyes@example.com" },
  { id: 106, name: "Hiro Tanaka", email: "hiro.tanaka@example.com" },
];

export const imported: ImportRow[] = [];

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const { pathname } = new URL(url, "http://advisor.local");
  if (pathname === "/api/clients") {
    await wait(100, 200);
    return json({ clients: CLIENTS, total: CLIENTS.length });
  }
  if (pathname === "/api/clients/import" && init?.method === "POST") {
    await wait(200, 400);
    const rows = JSON.parse(String(init.body)) as ImportRow[];
    imported.push(...rows);
    return json({ imported: rows.length }, 201);
  }
  return json({ message: "Not found" }, 404);
}
