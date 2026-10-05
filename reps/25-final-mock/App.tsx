import { useEffect, useState } from "react";
import { completeTask, fetchDashboard } from "./api/client";
import { Countdown } from "./components/Countdown";
import { SpotlightCard } from "./components/SpotlightCard";
import { TaskList } from "./components/TaskList";
import { TaskPanel } from "./components/TaskPanel";
import type { Dashboard } from "./types";

export default function App() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchDashboard().then((data) => {
      if (!cancelled) setDashboard(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!dashboard) return <div className="page muted">Loading your day</div>;

  const handleComplete = async (id: number) => {
    const done = await completeTask(id);
    setDashboard((current) => (current ? { ...current, tasks: current.tasks.map((t) => (t.id === done.id ? done : t)) } : current));
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Good morning, {dashboard.advisorName}</h1>
          <div className="muted">Monday, October 5, 2026</div>
        </div>
      </header>
      <div className="layout">
        <div className="stack">
          <TaskList tasks={dashboard.tasks} selectedId={selectedId} onSelect={setSelectedId} onComplete={handleComplete} />
          <TaskPanel tasks={dashboard.tasks} selectedId={selectedId} />
        </div>
        <div className="stack">
          <Countdown initialSeconds={dashboard.nextCallInSeconds} label={`with ${dashboard.nextCallWith}`} />
          <SpotlightCard client={dashboard.client} spotlight={dashboard.spotlight} />
        </div>
      </div>
    </div>
  );
}
