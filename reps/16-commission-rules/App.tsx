import { useEffect, useState } from "react";
import { fetchRules, fetchSample } from "./api/client";
import { PreviewTable } from "./components/PreviewTable";
import { RuleEditor } from "./components/RuleEditor";
import type { Quarter, Rule, SampleBooking } from "./types";

export default function App() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [quarter, setQuarter] = useState<Quarter>("Q3");
  const [bookings, setBookings] = useState<SampleBooking[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchRules().then((loadedRules) => {
      if (!cancelled) setRules(loadedRules);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchSample(quarter).then((set) => {
      if (cancelled) return;
      setBookings(set.bookings);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [quarter]);

  if (!loaded || rules.length === 0) return <div className="page muted">Loading rules</div>;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Commission rules</h1>
          <div className="muted">Edit rates and see what last quarter's bookings would have paid.</div>
        </div>
        <select value={quarter} onChange={(e) => setQuarter(e.target.value as Quarter)} aria-label="Sample quarter">
          <option value="Q3">Q3 2026 sample</option>
          <option value="Q4">Q4 2026 sample</option>
        </select>
      </header>
      <div className="layout" style={{ gridTemplateColumns: "1fr 2fr" }}>
        <RuleEditor rules={rules} onChange={setRules} />
        <PreviewTable bookings={bookings} rules={rules} quarter={quarter} />
      </div>
    </div>
  );
}
