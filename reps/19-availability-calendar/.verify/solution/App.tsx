import { useEffect, useState } from "react";
import { fetchAvailability } from "./api/client";
import { addDays } from "./components/dates";
import { MonthGrid } from "./components/MonthGrid";
import { StaySummary } from "./components/StaySummary";
import type { MonthAvailability } from "./types";

const MONTHS = [
  { value: "2026-11", label: "November 2026" },
  { value: "2027-03", label: "March 2027" },
];

export default function App() {
  const [month, setMonth] = useState(MONTHS[0].value);
  const [availability, setAvailability] = useState<MonthAvailability | null>(null);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [nights, setNights] = useState(3);
  const [flexible, setFlexible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAvailability(month).then((data) => {
      if (!cancelled) setAvailability(data);
    });
    return () => {
      cancelled = true;
    };
  }, [month]);

  if (!availability || availability.month !== month) return <div className="page muted">Loading availability</div>;

  const stayDates = new Set<string>();
  if (checkIn) {
    for (let i = 0; i < nights; i++) stayDates.add(addDays(checkIn, i));
    if (flexible) {
      stayDates.add(addDays(checkIn, -1));
      stayDates.add(addDays(checkIn, nights));
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>{availability.hotel}: availability</h1>
          <div className="muted">Rates are per night; sold-out days are greyed.</div>
        </div>
        <select
          value={month}
          onChange={(e) => {
            setMonth(e.target.value);
            setCheckIn(null);
          }}
          aria-label="Month"
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </header>
      <div className="layout">
        <MonthGrid cells={availability.cells} selected={checkIn} stayDates={stayDates} onPick={setCheckIn} />
        <StaySummary cells={availability.cells} checkIn={checkIn} nights={nights} flexible={flexible} onNightsChange={setNights} onFlexibleChange={setFlexible} />
      </div>
    </div>
  );
}
