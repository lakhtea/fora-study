import { useCallback, useEffect, useState } from "react";
import { fetchPayouts, fetchSettings } from "./api/client";
import { EstimatePanel } from "./components/EstimatePanel";
import { PayoutTable } from "./components/PayoutTable";
import { ThresholdSettings } from "./components/ThresholdSettings";
import type { Payout, PayoutSettings } from "./types";

export default function App() {
  const [rows, setRows] = useState<Payout[]>([]);
  const [settings, setSettings] = useState<PayoutSettings | null>(null);
  const [threshold, setThreshold] = useState<number | undefined>();
  const [selectedId, setSelectedId] = useState<string | number>("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    const [payouts, loadedSettings] = await Promise.all([fetchPayouts(), fetchSettings()]);
    setRows(payouts);
    setSettings(loadedSettings);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markReviewed = () => {
    setRows((current) => current.map((row) => (row.id === selectedId ? { ...row, reviewed: true } : row)));
  };

  if (!settings) return <div className="page muted">Loading payouts</div>;

  const effectiveThreshold = threshold ?? settings.defaultThreshold;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Payouts</h1>
          <div className="muted">{rows.length} payout periods, paid {settings.schedule}</div>
        </div>
      </header>
      <div className="layout">
        <div className="stack">
          <PayoutTable rows={rows} selectedId={selectedId} onSelect={setSelectedId} onMarkReviewed={markReviewed} />
          <ThresholdSettings threshold={threshold} defaultThreshold={settings.defaultThreshold} onChange={setThreshold} />
        </div>
        <EstimatePanel rows={rows} threshold={effectiveThreshold} onRefresh={load} refreshing={refreshing} />
      </div>
    </div>
  );
}
