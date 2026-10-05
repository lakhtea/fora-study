import { useEffect, useMemo, useState } from "react";
import { fetchCommissions, startExport } from "./api/client";
import { CommissionTable } from "./components/CommissionTable";
import { ExportPanel } from "./components/ExportPanel";
import { FilterBar } from "./components/FilterBar";
import type { Commission, ExportJob, Filters } from "./types";

function startOfDay(date: string): number {
  return new Date(date).getTime();
}

export function applyFilters(rows: Commission[], filters: Filters): Commission[] {
  const fromTs = filters.from ? startOfDay(filters.from) : -Infinity;
  const toTs = filters.to ? startOfDay(filters.to) : Infinity;
  return rows.filter((row) => {
    const travelTs = Date.parse(row.travelDate);
    const inRange = travelTs >= fromTs && travelTs <= toTs;
    const statusMatches = filters.status === "all" || row.status === filters.status;
    return inRange && statusMatches;
  });
}

export default function App() {
  const [rows, setRows] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ status: "all", from: "", to: "" });
  const [jobs, setJobs] = useState<ExportJob[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchCommissions().then((data) => {
      if (cancelled) return;
      setRows(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => applyFilters(rows, filters), [rows, filters]);

  const runExport = () => {
    startExport(filters, visible.length).then((job) => setJobs((current) => [...current, job]));
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "e" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLSelectElement)) {
        runExport();
      }
    };
    window.addEventListener("keydown", onKey);
  }, [filters, visible]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Commissions</h1>
          <div className="muted">{loading ? "Loading" : `${rows.length} bookings this quarter`}</div>
        </div>
      </header>
      <FilterBar filters={filters} onChange={setFilters} />
      <div className="layout">
        {loading ? <div className="empty">Loading commissions</div> : <CommissionTable rows={visible} />}
        <ExportPanel filters={filters} jobs={jobs} onExport={runExport} />
      </div>
    </div>
  );
}
