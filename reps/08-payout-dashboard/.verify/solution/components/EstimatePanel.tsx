import { useMemo } from "react";
import type { Payout } from "../types";
import { money } from "../../../shared/format";

interface EstimatePanelProps {
  rows: Payout[];
  threshold: number;
  onRefresh: () => void;
  refreshing: boolean;
}

export function EstimatePanel({ rows, threshold, onRefresh, refreshing }: EstimatePanelProps) {
  const estimate = useMemo(() => {
    const pending = rows.filter((row) => row.status === "pending").reduce((sum, row) => sum + row.amount, 0);
    const held = rows.filter((row) => row.status === "held").reduce((sum, row) => sum + row.amount, 0);
    return { pending, held, ready: pending >= threshold, shortBy: Math.max(0, threshold - pending) };
  }, [rows, threshold]);

  return (
    <div className="panel">
      <div className="card-header">
        <h2>Next payout</h2>
        <button type="button" className="secondary" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? "Refreshing" : "Refresh"}
        </button>
      </div>
      <div className="total" aria-label="Estimate">
        {estimate.ready ? `${money(estimate.pending)} ready` : `Not yet: ${money(estimate.pending)} of ${money(threshold)}`}
      </div>
      <p className="muted">
        {estimate.ready ? "Releases on the next monthly run." : `${money(estimate.shortBy)} more in pending commissions needed.`} {money(estimate.held)} is held pending supplier confirmation.
      </p>
    </div>
  );
}
