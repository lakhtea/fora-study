import type { PriceAlert } from "../types";
import { money } from "../../../shared/format";

function nextCheck(lastChecked: string): string {
  const [y, m, d] = lastChecked.split("-").map(Number);
  const date = new Date(y, m - 1, d + 1);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function shortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function AlertTable({ alerts }: { alerts: PriceAlert[] }) {
  if (alerts.length === 0) return <div className="empty">No price alerts yet.</div>;
  return (
    <table aria-label="Price alerts">
      <thead>
        <tr>
          <th>Booking</th>
          <th>Paid</th>
          <th>Now</th>
          <th>Last check</th>
          <th>Next check</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {alerts.map((alert) => (
          <tr key={alert.id}>
            <td>
              {alert.hotel}
              <div className="muted">
                {alert.reference}, {alert.client}
              </div>
            </td>
            <td>{money(alert.paidNightly)}</td>
            <td className={alert.currentNightly < alert.paidNightly ? "error" : undefined}>{money(alert.currentNightly)}</td>
            <td aria-label={`Last check ${alert.reference}`}>{shortDate(alert.lastChecked)}</td>
            <td aria-label={`Next check ${alert.reference}`}>{nextCheck(alert.lastChecked)}</td>
            <td>
              <span className={`badge ${alert.status === "active" ? "active" : "paused"}`}>{alert.status}</span> {alert.checks} checks
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
