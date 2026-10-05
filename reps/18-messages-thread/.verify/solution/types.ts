export type MessageStatus = "sent" | "delivered" | "read";

export interface Thread {
  clientId: number;
  clientName: string;
  lastMessage: string;
  unread: number;
}

export interface Message {
  id: number;
  from: "advisor" | "client";
  text: string;
  sentAt: string;
  status: MessageStatus;
}
