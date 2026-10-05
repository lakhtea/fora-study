import type { DayCell } from "../types";
import { formatDate, money } from "../../../shared/format";
import { addDays, nightsBetween } from "./dates";

interface StaySummaryProps {
  cells: DayCell[];
  checkIn: string | null;
  nights: number;
  flexible: boolean;
  onNightsChange: (nights: number) => void;
  onFlexibleChange: (flexible: boolean) => void;
}

export function StaySummary({ cells, checkIn, nights, flexible, onNightsChange, onFlexibleChange }: StaySummaryProps) {
  const checkOut = checkIn ? addDays(checkIn, nights) : null;
  const selectedCell = cells.find((cell) => cell.date === checkIn) ?? null;
  const stayNights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const total = selectedCell ? selectedCell.rate * stayNights : 0;

  return (
    <div className="panel">
      <h2>Book these nights</h2>
      <div className="form">
        <label>
          Nights
          <select value={nights} onChange={(e) => onNightsChange(Number(e.target.value))} aria-label="Nights">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" checked={flexible} onChange={(e) => onFlexibleChange(e.target.checked)} aria-label="Flexible dates" /> flexible dates (show a day either side)
        </label>
      </div>
      {checkIn && checkOut && selectedCell ? (
        <dl>
          <dt>Check-in</dt>
          <dd>{formatDate(checkIn)}</dd>
          <dt>Check-out</dt>
          <dd>{formatDate(checkOut)}</dd>
          <dt>Nights</dt>
          <dd aria-label="Night count">{stayNights}</dd>
          <dt>Rate</dt>
          <dd>{money(selectedCell.rate)} per night</dd>
          <dt>Total</dt>
          <dd className="total" aria-label="Stay total">
            {money(total)}
          </dd>
        </dl>
      ) : (
        <p className="muted">Pick a check-in day on the grid.</p>
      )}
      <p className="muted" aria-label="Flexibility note">
        {flexible ? "Showing a day either side of your dates." : "Exact dates only."}
      </p>
    </div>
  );
}
