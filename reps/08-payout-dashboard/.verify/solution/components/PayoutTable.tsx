import type { Payout } from "../types";
import { money } from "../../../shared/format";

interface PayoutTableProps {
  rows: Payout[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onMarkReviewed: () => void;
}

function monthLabel(month: string): string {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function PayoutTable({ rows, selectedId, onSelect, onMarkReviewed }: PayoutTableProps) {
  const selected = rows.find((row) => row.id === selectedId);
  return (
    <div>
      <table aria-label="Payouts">
        <thead>
          <tr>
            <th>Month</th>
            <th>Bookings</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Reviewed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={row.id === selectedId ? "selected" : undefined}>
              <td>{monthLabel(row.month)}</td>
              <td>{row.bookings}</td>
              <td>{money(row.amount)}</td>
              <td>
                <span className={`badge ${row.status}`}>{row.status}</span>
              </td>
              <td aria-label={`Reviewed ${row.month}`}>{row.reviewed ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="toolbar">
        <select value={selectedId ?? ""} onChange={(e) => onSelect(e.target.value === "" ? null : Number(e.target.value))} aria-label="Payout to review">
          <option value="">Pick a payout</option>
          {rows.map((row) => (
            <option key={row.id} value={row.id}>
              {monthLabel(row.month)}
            </option>
          ))}
        </select>
        <button type="button" className="secondary" onClick={onMarkReviewed} disabled={selectedId === null}>
          Mark as reviewed
        </button>
        <span className="muted" aria-label="Selected payout">
          Selected: {selected ? monthLabel(selected.month) : "none"}
        </span>
      </div>
    </div>
  );
}
