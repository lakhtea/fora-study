import { useEffect, useState } from "react";
import { fetchRate, fetchTripCosts } from "./api/client";
import { CostTable } from "./components/CostTable";
import { RatePanel } from "./components/RatePanel";
import type { TripCosts } from "./types";

const MARKUP = 0.02;
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function App() {
  const [trip, setTrip] = useState<TripCosts | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [includeFees, setIncludeFees] = useState(true);
  const [converted, setConverted] = useState<{ id: number; usd: number }[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchTripCosts(7), fetchRate()]).then(([data, fx]) => {
      if (cancelled) return;
      setRate(fx);
      setTrip(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!trip || rate === null) return;
    const lines = includeFees ? trip.lines : trip.lines.filter((line) => line.category !== "fees");
    setConverted(lines.map((line) => ({ id: line.id, usd: Math.round(line.amount * rate * (1 + MARKUP) * 100) / 100 })));
  }, [trip, includeFees]);

  if (!trip || rate === null) return <div className="page muted">Loading costs</div>;

  const visibleLines = includeFees ? trip.lines : trip.lines.filter((line) => line.category !== "fees");
  const total = converted.reduce((sum, line) => sum + line.usd, 0);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>{trip.title}: costs</h1>
          <div className="muted">Supplier prices in EUR, client total in USD at the client rate.</div>
        </div>
        <div className="total" aria-label="Client total">
          {usd.format(total)}
        </div>
      </header>
      <div className="layout">
        <CostTable lines={visibleLines} converted={converted} />
        <RatePanel rate={rate} markup={MARKUP} includeFees={includeFees} onRateChange={setRate} onIncludeFeesChange={setIncludeFees} />
      </div>
    </div>
  );
}
