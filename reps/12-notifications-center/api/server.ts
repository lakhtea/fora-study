import { json, wait } from "../../../shared/format";

interface NotificationRecord {
  id: number;
  type: "price_drop" | "booking" | "message" | "payout";
  title: string;
  body: string;
  status: "unread" | "read";
  createdAt: string;
  savings: string | null;
}

const NOTIFICATIONS: NotificationRecord[] = [
  { id: 1, type: "price_drop", title: "Rate dropped: Four Seasons Lisbon", body: "Maya's November stay is now $120.00 cheaper. Rebook to lock it in.", status: "unread", createdAt: "2026-10-04T14:12:00Z", savings: "120.00" },
  { id: 2, type: "booking", title: "Booking confirmed: Scottsdale Princess", body: "Daniel Reyes, Oct 22 to 26. Reference FORA-610298.", status: "unread", createdAt: "2026-10-04T11:03:00Z", savings: null },
  { id: 3, type: "message", title: "New message from Hiro Tanaka", body: "Can we add a night in Osaka?", status: "unread", createdAt: "2026-10-03T22:40:00Z", savings: null },
  { id: 4, type: "price_drop", title: "Rate dropped: Aman Kyoto", body: "Hiro's March stay is now $45.50 cheaper.", status: "read", createdAt: "2026-10-03T09:15:00Z", savings: "45.50" },
  { id: 5, type: "payout", title: "September payout sent", body: "$1,100 is on its way to your account.", status: "read", createdAt: "2026-10-02T16:00:00Z", savings: null },
  { id: 6, type: "price_drop", title: "Rate dropped: Belmond Hotel Caruso", body: "Elena's November stay is now $210.00 cheaper.", status: "unread", createdAt: "2026-10-01T08:30:00Z", savings: "210.00" },
  { id: 7, type: "message", title: "New message from Priya Natarajan", body: "Thinking about Portugal in spring.", status: "unread", createdAt: "2026-09-30T19:20:00Z", savings: null },
  { id: 8, type: "booking", title: "Booking confirmed: Enchantment Resort", body: "Grace Whitfield, Dec 5 to 9.", status: "read", createdAt: "2026-09-29T13:05:00Z", savings: null },
];

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const { pathname, searchParams } = new URL(url, "http://advisor.local");

  if (pathname === "/api/notifications") {
    await wait(100, 200);
    const status = searchParams.get("status") ?? "all";
    return json(NOTIFICATIONS.filter((n) => status === "all" || n.status === status));
  }

  const match = pathname.match(/^\/api\/notifications\/(\d+)\/read$/);
  if (match && init?.method === "POST") {
    await wait(60, 120);
    const record = NOTIFICATIONS.find((n) => n.id === Number(match[1]));
    if (!record) return json({ message: "Not found" }, 404);
    record.status = "read";
    return json(record);
  }

  return json({ message: "Not found" }, 404);
}

export function resetServer() {
  NOTIFICATIONS.forEach((n) => {
    n.status = [1, 2, 3, 6, 7].includes(n.id) ? "unread" : "read";
  });
}
