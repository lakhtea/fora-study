import { money } from "../../../shared/format";

interface ThresholdSettingsProps {
  threshold: number | undefined;
  defaultThreshold: number;
  onChange: (threshold: number | undefined) => void;
}

export function ThresholdSettings({ threshold, defaultThreshold, onChange }: ThresholdSettingsProps) {
  return (
    <div className="panel">
      <h2>Payout threshold</h2>
      <div className="form">
        <label>
          Release payouts once pending commissions reach
          <input
            type="number"
            min={0}
            step={50}
            value={threshold}
            placeholder={String(defaultThreshold)}
            onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
            aria-label="Threshold"
          />
        </label>
        <div className="row">
          <button type="button" className="secondary" onClick={() => onChange(undefined)}>
            Reset to default
          </button>
          <span className="muted" aria-label="Threshold summary">
            {threshold === undefined ? `Default (${money(defaultThreshold)})` : `Custom: ${money(threshold)}`}
          </span>
        </div>
      </div>
    </div>
  );
}
