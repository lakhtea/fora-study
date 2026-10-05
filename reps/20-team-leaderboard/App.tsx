import { useEffect, useState } from "react";
import { fetchAdvisors, fetchLeaderboard } from "./api/client";
import { Board } from "./components/Board";
import { BoardContext } from "./components/BoardContext";
import { MyRank } from "./components/MyRank";
import type { Advisor, Period, RankById, RankedRow } from "./types";

export default function App() {
  const [period, setPeriod] = useState<Period>("month");
  const [rows, setRows] = useState<RankedRow[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [viewAsId, setViewAsId] = useState(1);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;
    fetchAdvisors().then((list) => {
      if (!cancelled) setAdvisors(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard(period).then((data) => {
      if (cancelled) return;
      setRows(data);
      setUpdatedAt(Date.now());
    });
    return () => {
      cancelled = true;
    };
  }, [period]);

  useEffect(() => {
    const handle = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(handle);
  }, []);

  if (rows.length === 0 || advisors.length === 0) return <div className="page muted">Loading leaderboard</div>;

  const rankById: RankById = Object.fromEntries(rows.map((row) => [row.advisorId, row]));
  const secondsSinceUpdate = updatedAt ? Math.max(0, Math.floor((now - updatedAt) / 1000)) : 0;

  return (
    <BoardContext.Provider value={{ period, rows, rankById, secondsSinceUpdate }}>
      <div className="page">
        <header className="page-header">
          <div>
            <h1>Team leaderboard</h1>
            <div className="muted counter" aria-label="Updated">
              Updated {secondsSinceUpdate}s ago
            </div>
          </div>
          <select value={period} onChange={(e) => setPeriod(e.target.value as Period)} aria-label="Period">
            <option value="month">This month</option>
            <option value="quarter">This quarter</option>
          </select>
        </header>
        <div className="layout">
          <Board />
          <MyRank advisors={advisors} viewAsId={viewAsId} onViewAs={setViewAsId} />
        </div>
      </div>
    </BoardContext.Provider>
  );
}
