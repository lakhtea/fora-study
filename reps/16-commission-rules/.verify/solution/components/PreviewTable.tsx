import { useMemo, useRef } from "react";
import type { Quarter, Rule, SampleBooking } from "../types";
import { money } from "../../../shared/format";

interface PreviewTableProps {
  bookings: SampleBooking[];
  rules: Rule[];
  quarter: Quarter;
}

function commissionFor(booking: SampleBooking, rules: Rule[]): number | null {
  const rule = rules.find((candidate) => candidate.tier === booking.tier);
  if (!rule) return null;
  if (!rule.enabled) return 0;
  return Math.round(booking.gross * (rule.rate / 100));
}

function simulateHeavyRender(): void {
  const end = performance.now() + 25;
  while (performance.now() < end) {
    // stands in for 2,000 formatted rows
  }
}

export function PreviewTable({ bookings, rules, quarter }: PreviewTableProps) {
  const renders = useRef(0);
  renders.current += 1;
  simulateHeavyRender();

  const totals = useMemo(() => {
    let total = 0;
    let unruled = 0;
    for (const booking of bookings) {
      const commission = commissionFor(booking, rules);
      if (commission === null) unruled += 1;
      else total += commission;
    }
    const gross = bookings.reduce((sum, booking) => sum + booking.gross, 0);
    return { total, gross, count: bookings.length, unruled };
  }, [rules, bookings]);

  return (
    <div className="panel" data-renders={renders.current} data-testid="preview">
      <h2>
        {quarter} sample: {totals.count.toLocaleString()} bookings
      </h2>
      <div className="total" aria-label="Preview total">
        {money(totals.total)} commission on {money(totals.gross)}
      </div>
      {totals.unruled > 0 && (
        <div className="danger" role="alert">
          {totals.unruled.toLocaleString()} bookings have no matching rule and earn nothing until one exists.
        </div>
      )}
      <table aria-label="Preview rows">
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Tier</th>
            <th>Gross</th>
            <th>Commission</th>
          </tr>
        </thead>
        <tbody>
          {bookings.slice(0, 12).map((booking) => (
            <tr key={booking.id}>
              <td>{booking.supplier}</td>
              <td>{booking.tier}</td>
              <td>{money(booking.gross)}</td>
              <td aria-label={`Commission ${booking.id}`}>{(() => { const c = commissionFor(booking, rules); return c === null ? "No rule" : money(c); })()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted">Showing the first 12 of {totals.count.toLocaleString()} bookings.</p>
    </div>
  );
}
