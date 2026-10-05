import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchClients, fetchUpcomingTrips } from "./api/client";
import { ClientDetail } from "./components/ClientDetail";
import { ClientTable } from "./components/ClientTable";
import { RefreshIndicator } from "./components/RefreshIndicator";
import { SearchBar } from "./components/SearchBar";
import type { Client, ClientStatus, SortKey, Trip } from "./types";

export default function App() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ClientStatus | "all">("all");
  const [clients, setClients] = useState<Client[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [refreshedAt, setRefreshedAt] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("lastName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchClients({ search, status }).then((result) => {
      if (cancelled) return;
      setClients(result);
      setRefreshedAt(Date.now());
    });
    return () => {
      cancelled = true;
    };
  }, [search, status]);

  useEffect(() => {
    let cancelled = false;
    fetchUpcomingTrips().then((result) => {
      if (!cancelled) setTrips(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const tripsByClient = useMemo(() => {
    const map = new Map<number, Trip[]>();
    for (const trip of trips) {
      const list = map.get(trip.clientId) ?? [];
      list.push(trip);
      map.set(trip.clientId, list);
    }
    return map;
  }, [trips]);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (key === sortKey) {
        setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey]
  );

  const handleSearchChange = useCallback((value: string) => setSearch(value), []);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Clients</h1>
          <div className="muted">{clients.length} shown</div>
        </div>
        <RefreshIndicator refreshedAt={refreshedAt} />
      </header>
      <SearchBar status={status} onSearchChange={handleSearchChange} onStatusChange={setStatus} />
      <div className="layout">
        <ClientTable
          clients={clients}
          sortKey={sortKey}
          sortDir={sortDir}
          selectedId={selectedId}
          onSort={handleSort}
          onSelect={setSelectedId}
        />
        <ClientDetail clientId={selectedId} tripsByClient={tripsByClient} />
      </div>
    </div>
  );
}
