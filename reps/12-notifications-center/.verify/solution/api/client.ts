import type { Notification, StatusFilter } from "../types";
import { apiFetch } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) throw new Error(`${what} failed (${res.status})`);
  return res;
}

interface NotificationWire extends Omit<Notification, "savings"> {
  savings: string | number | null;
}

function toNotification(row: NotificationWire): Notification {
  return { ...row, savings: row.savings === null ? null : Number(row.savings) };
}

export async function fetchNotifications(status: StatusFilter): Promise<Notification[]> {
  const params = status === "all" ? "" : `?status=${status}`;
  const res = await requireOk(await apiFetch(`/api/notifications${params}`), "Loading notifications");
  const rows = (await res.json()) as NotificationWire[];
  return rows.map(toNotification);
}

export async function markRead(id: number): Promise<Notification> {
  const res = await requireOk(await apiFetch(`/api/notifications/${id}/read`, { method: "POST" }), "Marking read");
  return toNotification((await res.json()) as NotificationWire);
}
