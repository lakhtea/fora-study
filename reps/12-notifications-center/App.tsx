import { useEffect, useState } from "react";
import { fetchNotifications, markRead } from "./api/client";
import { FilterBar } from "./components/FilterBar";
import { NotificationList } from "./components/NotificationList";
import { SavingsPanel } from "./components/SavingsPanel";
import type { Notification, StatusFilter } from "./types";

export default function App() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [items, setItems] = useState<Notification[]>([]);
  const [summary, setSummary] = useState({ unread: 0, shown: 0 });
  const [requests, setRequests] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setRequests((n) => n + 1);
    fetchNotifications(filter).then((rows) => {
      if (cancelled) return;
      setItems(rows);
      setLoaded(true);
      if (filter !== "all") {
        setSummary({ unread: rows.filter((row) => row.status === "unread").length, shown: rows.length });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [filter, summary]);

  const unread = items.filter((item) => item.status === "unread").length;

  const handleMarkRead = (id: number) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, status: "read" } : item)));
    markRead(id);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Notifications</h1>
          <div className="muted" aria-label="Unread count">
            {loaded ? `${unread} unread` : "Loading"}
            {filter !== "all" ? ` (showing ${summary.shown})` : ""}
          </div>
        </div>
        <span className="muted counter" aria-label="Requests sent">
          Requests sent: {requests}
        </span>
      </header>
      <FilterBar filter={filter} onChange={setFilter} />
      <div className="layout">
        <NotificationList items={items} onMarkRead={handleMarkRead} />
        <SavingsPanel items={items} />
      </div>
    </div>
  );
}
