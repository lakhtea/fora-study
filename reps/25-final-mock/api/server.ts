import type { Dashboard } from "../types";
import { json, wait } from "../../../shared/format";

const DASHBOARD: Dashboard = {
  advisorName: "Lakhte",
  nextCallInSeconds: 899,
  nextCallWith: "Daniel Reyes",
  tasks: [
    { id: 1, title: "Confirm Scottsdale late checkout", client: "Daniel Reyes", due: "10:30", done: false },
    { id: 2, title: "Send Lisbon proposal v2", client: "Maya Okafor", due: "12:00", done: false },
    { id: 3, title: "Chase Kyoto rate", client: "Hiro Tanaka", due: "15:00", done: false },
    { id: 4, title: "Reply to Priya about Portugal", client: "Priya Natarajan", due: "17:00", done: false },
  ],
  client: { id: 101, name: "Maya Okafor", phone: "+1 718 555 0142", email: "maya.okafor@example.com", city: "Brooklyn" },
  spotlight: { clientId: 101, name: "Lisbon long weekend", departs: "2026-11-03", status: "booked", total: 6400 },
};

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const { pathname } = new URL(url, "http://advisor.local");
  if (pathname === "/api/dashboard") {
    await wait(120, 240);
    return json(DASHBOARD);
  }
  const match = pathname.match(/^\/api\/tasks\/(\d+)\/done$/);
  if (match && init?.method === "POST") {
    await wait(80, 160);
    const task = DASHBOARD.tasks.find((t) => t.id === Number(match[1]));
    if (!task) return json({ message: "Not found" }, 404);
    task.done = true;
    return json(task);
  }
  return json({ message: "Not found" }, 404);
}

export function resetServer() {
  DASHBOARD.tasks.forEach((t) => {
    t.done = false;
  });
}
