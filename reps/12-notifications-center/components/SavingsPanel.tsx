import type { Notification } from "../types";
import { moneyCents } from "../../../shared/format";

export function SavingsPanel({ items }: { items: Notification[] }) {
  const drops = items.filter((item) => item.type === "price_drop");
  const total = drops.reduce((sum, item) => sum + (item.savings ?? 0), 0);
  return (
    <div className="panel">
      <h2>Price drops this month</h2>
      <div className="total" aria-label="Savings total">
        {moneyCents(total)}
      </div>
      <p className="muted">
        {drops.length} rate drops caught for your clients. {drops.length > 0 ? `Largest: ${moneyCents(Math.max(...drops.map((d) => Number(d.savings ?? 0))))}.` : ""}
      </p>
    </div>
  );
}
