import type { Trip } from "../types";
import { money } from "../../../shared/format";

interface TimelineProps {
  trips: Trip[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

function shortDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function Timeline({ trips, selectedId, onSelect }: TimelineProps) {
  if (trips.length === 0) return <div className="empty">No trips match.</div>;
  const sorted = [...trips].sort((a, b) => a.startDate.localeCompare(b.startDate));
  return (
    <ul className="list" aria-label="Timeline">
      {sorted.map((trip) => (
        <li key={trip.id} className={trip.id === selectedId ? "selected" : undefined}>
          <span>
            <button type="button" className="link" onClick={() => onSelect(trip.id)} aria-label={`Open ${trip.destination}`}>
              {trip.destination}
            </button>{" "}
            <span className="muted">{trip.clientName}</span>
          </span>
          <span>
            <span className="muted" aria-label={`Dates for ${trip.destination}`}>
              {shortDate(trip.startDate)} to {shortDate(trip.endDate)}
            </span>{" "}
            <span className={`badge ${trip.status}`}>{trip.status}</span> {money(trip.total)}
          </span>
        </li>
      ))}
    </ul>
  );
}
