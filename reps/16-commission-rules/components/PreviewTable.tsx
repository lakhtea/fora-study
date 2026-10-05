import { useMemo, useRef } from "react";
import type { Quarter, Rule, SampleBooking } from "../types";
import { money } from "../../../shared/format";

interface PreviewTableProps {
  bookings: SampleBooking[];
  rules: Rule[];
  quarter: Quarter;
}

function commissionFor(booking: SampleBooking, rules: Rule[]): number {
  const rate = rules.find((rule) => rule.tier === booking.tier && rule.enabled)?.rate ?? 0;
  return Math.round(booking.gross * (rate / 100));
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
    const total = bookings.reduce((sum, booking) => sum + commissionFor(booking, rules), 0);
    const gross = bookings.reduce((sum, booking) => sum + booking.gross, 0);
    return { total, gross, count: bookings.length };
  }, [rules]);

  return (
    <div className="panel" data-renders={renders.current} data-testid="preview">
      <h2>
        {quarter} sample: {totals.count.toLocaleString()} bookings
      </h2>
      <div className="total" aria-label="Preview total">
        {money(totals.total)} commission on {money(totals.gross)}
      </div>
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
              <td aria-label={`Commission ${booking.id}`}>{money(commissionFor(booking, rules))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted">Showing the first 12 of {totals.count.toLocaleString()} bookings.</p>
    </div>
  );
}
