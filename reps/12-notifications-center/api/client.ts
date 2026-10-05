import type { Notification, StatusFilter } from "../types";
import { apiFetch } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) throw new Error(`${what} failed (${res.status})`);
  return res;
}

export async function fetchNotifications(status: StatusFilter): Promise<Notification[]> {
  const params = status === "all" ? "" : `?status=${status}`;
  const res = await requireOk(await apiFetch(`/api/notifications${params}`), "Loading notifications");
  return res.json();
}

export async function markRead(id: number): Promise<Notification> {
  const res = await requireOk(await apiFetch(`/api/notifications/${id}/read`, { method: "POST" }), "Marking read");
  return res.json();
}
