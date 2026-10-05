import type { Thread } from "../types";

interface ThreadListProps {
  threads: Thread[];
  selectedId: number | null;
  onSelect: (clientId: number) => void;
}

export function ThreadList({ threads, selectedId, onSelect }: ThreadListProps) {
  return (
    <div className="panel">
      <h2>Clients</h2>
      <ul className="list" aria-label="Threads">
        {threads.map((thread) => (
          <li key={thread.clientId} className={thread.clientId === selectedId ? "selected" : undefined}>
            <span>
              <button type="button" className="link" onClick={() => onSelect(thread.clientId)} aria-label={`Open ${thread.clientName}`}>
                {thread.clientName}
              </button>
              <div className="muted">{thread.lastMessage}</div>
            </span>
            {thread.unread > 0 && <span className="badge pending">{thread.unread}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
