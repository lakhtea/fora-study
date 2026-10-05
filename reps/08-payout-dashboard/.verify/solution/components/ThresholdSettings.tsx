import { money } from "../../../shared/format";

interface ThresholdSettingsProps {
  thresholdText: string;
  defaultThreshold: number;
  onChange: (thresholdText: string) => void;
}

export function ThresholdSettings({ thresholdText, defaultThreshold, onChange }: ThresholdSettingsProps) {
  const threshold = thresholdText === "" ? undefined : Number(thresholdText);
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
            value={thresholdText}
            placeholder={String(defaultThreshold)}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Threshold"
          />
        </label>
        <div className="row">
          <button type="button" className="secondary" onClick={() => onChange("")}>
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
