import type { DayCell } from "../types";
import { money } from "../../../shared/format";

interface MonthGridProps {
  cells: DayCell[];
  selected: string | null;
  stayDates: Set<string>;
  onPick: (date: string) => void;
}

export function MonthGrid({ cells, selected, stayDates, onPick }: MonthGridProps) {
  return (
    <div className="panel">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }} aria-label="Month grid">
        {cells.map((cell) => {
          const day = Number(cell.date.slice(-2));
          const inStay = stayDates.has(cell.date);
          return (
            <button
              key={cell.date}
              type="button"
              disabled={!cell.available}
              onClick={() => onPick(cell.date)}
              aria-label={`Day ${day}`}
              aria-pressed={cell.date === selected}
              className={inStay ? "primary" : "secondary"}
              style={{ padding: 6, fontSize: 12, opacity: cell.available ? 1 : 0.4 }}
            >
              {day}
              <div className="muted" style={{ fontSize: 11, color: inStay ? "white" : undefined }}>
                {cell.available ? money(cell.rate) : "sold out"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
