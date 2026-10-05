import type { Dashboard, Task } from "../types";
import { apiFetch } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) throw new Error(`${what} failed (${res.status})`);
  return res;
}

export async function fetchDashboard(): Promise<Dashboard> {
  const res = await requireOk(await apiFetch("/api/dashboard"), "Loading dashboard");
  return res.json();
}

export async function completeTask(id: number): Promise<Task> {
  const res = await requireOk(await apiFetch(`/api/tasks/${id}/done`, { method: "POST" }), "Completing task");
  return res.json();
}
