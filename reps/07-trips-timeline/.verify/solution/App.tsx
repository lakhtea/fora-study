import { useCallback, useEffect, useState } from "react";
import { searchTrips } from "./api/client";
import { SearchBox } from "./components/SearchBox";
import { Timeline } from "./components/Timeline";
import { TripDrawer } from "./components/TripDrawer";
import type { Trip, TripStatus } from "./types";
import { money } from "../../shared/format";

export default function App() {
  const [query, setQuery] = useState("");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [status, setStatus] = useState<TripStatus | "all">("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setRequests((n) => n + 1);
    searchTrips(query).then((rows) => {
      if (cancelled) return;
      setTrips(rows);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const handleSearch = useCallback((value: string) => setQuery(value), []);
  const visible = status === "all" ? trips : trips.filter((t) => t.status === status);
  const selected = trips.find((t) => t.id === selectedId) ?? null;
  const booked = visible.reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Trips</h1>
          <div className="muted" aria-label="Trip count">
            {loading ? "Searching" : `${visible.length} trips, ${money(booked)} booked`}
          </div>
        </div>
        <div className="muted counter" aria-label="Requests sent">
          Requests sent: {requests}
        </div>
      </header>
      <SearchBox onSearch={handleSearch} />
      <div className="toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value as TripStatus | "all")} aria-label="Status filter">
          <option value="all">All statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="in-progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="layout">
        <Timeline trips={visible} selectedId={selectedId} onSelect={setSelectedId} />
        {selected ? <TripDrawer trip={selected} onClose={() => setSelectedId(null)} /> : <div className="panel empty">Open a trip to see its details.</div>}
      </div>
    </div>
  );
}
