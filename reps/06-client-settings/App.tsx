import { useEffect, useState } from "react";
import { fetchClients, fetchSettings, fetchTravelerDirectory } from "./api/client";
import { ClientList } from "./components/ClientList";
import { SettingsForm } from "./components/SettingsForm";
import type { ClientSettings, ClientSummary, TravelerDirectory } from "./types";

export default function App() {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [directory, setDirectory] = useState<TravelerDirectory | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [settings, setSettings] = useState<ClientSettings | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchClients(), fetchTravelerDirectory()]).then(([list, dir]) => {
      if (cancelled) return;
      setClients(list);
      setDirectory(dir);
      setSelectedId(list[0]?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    let cancelled = false;
    fetchSettings(selectedId).then((data) => {
      if (!cancelled) setSettings(data);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Client settings</h1>
          <div className="muted">Contact details, notification preferences, and linked travelers.</div>
        </div>
      </header>
      <div className="layout" style={{ gridTemplateColumns: "1fr 2fr" }}>
        <ClientList clients={clients} selectedId={selectedId} onSelect={setSelectedId} />
        {settings && directory ? <SettingsForm settings={settings} directory={directory} onSaved={setSettings} /> : <div className="panel empty">Loading</div>}
      </div>
    </div>
  );
}
