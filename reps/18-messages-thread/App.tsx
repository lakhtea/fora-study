import { useEffect, useState } from "react";
import { fetchMessages, fetchThreads, sendMessage, subscribeTyping } from "./api/client";
import { Composer } from "./components/Composer";
import { MessageList } from "./components/MessageList";
import { ThreadList } from "./components/ThreadList";
import type { Message, Thread } from "./types";

export default function App() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingFrom, setTypingFrom] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchThreads().then((rows) => {
      if (!cancelled) setThreads(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    setLoading(true);
    fetchMessages(selectedId).then((rows) => {
      setMessages(rows);
      setLoading(false);
    });
  }, [selectedId]);

  useEffect(() => {
    if (selectedId === null) return;
    subscribeTyping(selectedId, (name, typing) => setTypingFrom(typing ? name : null)).then((unsubscribe) => unsubscribe);
  }, [selectedId]);

  const thread = threads.find((t) => t.clientId === selectedId) ?? null;

  const handleSend = async (text: string) => {
    if (selectedId === null) return;
    const optimistic: Message = { id: -Date.now(), from: "advisor", text, sentAt: new Date().toISOString(), status: "Sent" };
    setMessages((current) => [...current, optimistic]);
    const saved = await sendMessage(selectedId, text);
    setMessages((current) => current.map((m) => (m.id === optimistic.id ? saved : m)));
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Messages</h1>
          <div className="muted">{threads.length} client conversations</div>
        </div>
      </header>
      <div className="layout" style={{ gridTemplateColumns: "1fr 2fr" }}>
        <ThreadList threads={threads} selectedId={selectedId} onSelect={setSelectedId} />
        <div className="panel">
          {thread ? (
            <>
              <h2 aria-label="Thread heading">{thread.clientName}</h2>
              {loading && messages.length === 0 ? <p className="muted">Loading</p> : <MessageList messages={messages} />}
              <div className="muted" aria-label="Typing indicator" style={{ minHeight: 20 }}>
                {typingFrom ? `${typingFrom} is typing` : ""}
              </div>
              <Composer onSend={handleSend} disabled={loading} />
            </>
          ) : (
            <p className="muted">Pick a conversation.</p>
          )}
        </div>
      </div>
    </div>
  );
}
