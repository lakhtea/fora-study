interface RatePanelProps {
  rate: number;
  markup: number;
  includeFees: boolean;
  onRateChange: (rate: number) => void;
  onIncludeFeesChange: (include: boolean) => void;
}

export function RatePanel({ rate, markup, includeFees, onRateChange, onIncludeFeesChange }: RatePanelProps) {
  const clientRate = rate + markup;
  return (
    <div className="panel form">
      <h2>Exchange rate</h2>
      <label>
        EUR to USD (mid-market)
        <input type="number" step={0.0001} value={rate} onChange={(e) => onRateChange(Number(e.target.value))} aria-label="Rate" />
      </label>
      <div className="muted" aria-label="Client rate">
        Client rate (with {markup} markup): {clientRate}
      </div>
      <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input type="checkbox" checked={includeFees} onChange={(e) => onIncludeFeesChange(e.target.checked)} aria-label="Include fees" /> include booking fees in the total
      </label>
    </div>
  );
}
