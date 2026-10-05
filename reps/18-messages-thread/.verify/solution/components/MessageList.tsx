import type { Message } from "../types";

function ticks(status: Message["status"]): string {
  if (status === "read") return "\u2713\u2713 read";
  if (status === "delivered") return "\u2713 delivered";
  return "\u23F1 sending";
}

export function MessageList({ messages }: { messages: Message[] }) {
  if (messages.length === 0) return <p className="muted">No messages yet.</p>;
  return (
    <ul className="list" aria-label="Messages">
      {messages.map((message) => (
        <li key={message.id} style={{ flexDirection: "column", alignItems: message.from === "advisor" ? "flex-end" : "flex-start" }}>
          <span>{message.text}</span>
          <span className="muted" aria-label={`Status ${message.id}`}>
            {message.from === "advisor" ? ticks(message.status) : new Date(message.sentAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </span>
        </li>
      ))}
    </ul>
  );
}
