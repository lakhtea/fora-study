import type { Commission } from "../types";
import { formatDate, money } from "../../../shared/format";

export function CommissionTable({ rows }: { rows: Commission[] }) {
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  if (rows.length === 0) return <div className="empty">No bookings match these filters.</div>;
  return (
    <table aria-label="Commissions">
      <thead>
        <tr>
          <th>Reference</th>
          <th>Client</th>
          <th>Supplier</th>
          <th>Travel date</th>
          <th>Status</th>
          <th>Commission</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.reference}</td>
            <td>{row.client}</td>
            <td>{row.supplier}</td>
            <td>{formatDate(row.travelDate.slice(0, 10))}</td>
            <td>
              <span className={`badge ${row.status}`}>{row.status}</span>
            </td>
            <td>{money(row.amount)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={5} aria-label="Total label">
            Total for {rows.length} {rows.length === 1 ? "booking" : "bookings"}
          </td>
          <td aria-label="Total commission">{money(total)}</td>
        </tr>
      </tfoot>
    </table>
  );
}
