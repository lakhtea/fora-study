import type { Thread } from "../types";
import { json, wait } from "../../../shared/format";

interface MessageRecord {
  id: number;
  from: "advisor" | "client";
  text: string;
  sentAt: string;
  status: "sent" | "delivered" | "read";
}

const THREADS: Thread[] = [
  { clientId: 101, clientName: "Maya Okafor", lastMessage: "Can we do the rooftop dinner on the first night?", unread: 1 },
  { clientId: 102, clientName: "Daniel Reyes", lastMessage: "Perfect, thank you!", unread: 0 },
  { clientId: 106, clientName: "Hiro Tanaka", lastMessage: "Thinking about adding Osaka.", unread: 2 },
];

const MESSAGES: Record<number, MessageRecord[]> = {
  101: [
    { id: 1, from: "client", text: "Hi! Lisbon is confirmed on our end.", sentAt: "2026-10-01T14:02:00Z", status: "read" },
    { id: 2, from: "advisor", text: "Wonderful. I'll hold the Four Seasons for Nov 3 to 10.", sentAt: "2026-10-01T14:10:00Z", status: "read" },
    { id: 3, from: "client", text: "Could we add a food walk on the 4th?", sentAt: "2026-10-02T09:30:00Z", status: "read" },
    { id: 4, from: "advisor", text: "Added the Alfama food walk at 10am.", sentAt: "2026-10-02T09:45:00Z", status: "read" },
    { id: 5, from: "client", text: "And a driver from the airport?", sentAt: "2026-10-03T18:12:00Z", status: "read" },
    { id: 6, from: "advisor", text: "Done, driver meets you at arrivals.", sentAt: "2026-10-03T18:20:00Z", status: "delivered" },
    { id: 7, from: "advisor", text: "Also booked the welcome drink on the rooftop.", sentAt: "2026-10-03T18:21:00Z", status: "delivered" },
    { id: 8, from: "client", text: "Can we do the rooftop dinner on the first night?", sentAt: "2026-10-04T08:05:00Z", status: "read" },
  ],
  102: [
    { id: 9, from: "advisor", text: "Scottsdale is confirmed, Oct 22 to 26.", sentAt: "2026-09-28T16:00:00Z", status: "read" },
    { id: 10, from: "client", text: "Perfect, thank you!", sentAt: "2026-09-28T16:30:00Z", status: "read" },
  ],
  106: [
    { id: 11, from: "client", text: "Thinking about adding Osaka.", sentAt: "2026-10-03T22:40:00Z", status: "read" },
    { id: 12, from: "client", text: "Two nights maybe?", sentAt: "2026-10-03T22:41:00Z", status: "read" },
    { id: 13, from: "advisor", text: "Easy. I'll price two nights at the Conrad.", sentAt: "2026-10-04T10:00:00Z", status: "sent" },
  ],
};
let nextId = 100;

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const { pathname } = new URL(url, "http://advisor.local");
  if (pathname === "/api/threads") {
    await wait(80, 160);
    return json(THREADS);
  }
  const match = pathname.match(/^\/api\/threads\/(\d+)\/messages$/);
  if (match) {
    const rows = MESSAGES[Number(match[1])] ?? [];
    if (init?.method === "POST") {
      await wait(120, 200);
      const { text } = JSON.parse(String(init.body)) as { text: string };
      const message: MessageRecord = { id: nextId++, from: "advisor", text, sentAt: new Date().toISOString(), status: "sent" };
      rows.push(message);
      return json(message, 201);
    }
    await wait(80 + rows.length * 90);
    return json(rows);
  }
  return json({ message: "Not found" }, 404);
}

const typingTimers = new Map<number, ReturnType<typeof setInterval>>();

export function subscribeTyping(clientId: number, onTyping: (clientName: string, typing: boolean) => void): Promise<() => void> {
  const name = THREADS.find((t) => t.clientId === clientId)?.clientName ?? "Someone";
  return new Promise((resolve) => {
    setTimeout(() => {
      const key = clientId * 1000 + Math.floor(Math.random() * 1000);
      const handle = setInterval(() => {
        onTyping(name, true);
        setTimeout(() => onTyping(name, false), 500);
      }, 900);
      typingTimers.set(key, handle);
      resolve(() => {
        clearInterval(handle);
        typingTimers.delete(key);
      });
    }, 60);
  });
}

export function resetServer() {
  typingTimers.forEach((handle) => clearInterval(handle));
  typingTimers.clear();
  Object.values(MESSAGES).forEach((rows) => rows.splice(rows.findIndex((m) => m.id >= 100) >= 0 ? rows.findIndex((m) => m.id >= 100) : rows.length));
}
