import type { Message, Thread } from "../types";
import { apiFetch } from "./server";

export { subscribeTyping } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) throw new Error(`${what} failed (${res.status})`);
  return res;
}

export async function fetchThreads(): Promise<Thread[]> {
  const res = await requireOk(await apiFetch("/api/threads"), "Loading threads");
  return res.json();
}

export async function fetchMessages(clientId: number): Promise<Message[]> {
  const res = await requireOk(await apiFetch(`/api/threads/${clientId}/messages`), "Loading messages");
  return res.json();
}

export async function sendMessage(clientId: number, text: string): Promise<Message> {
  const res = await requireOk(await apiFetch(`/api/threads/${clientId}/messages`, { method: "POST", body: JSON.stringify({ text }) }), "Sending");
  return res.json();
}
