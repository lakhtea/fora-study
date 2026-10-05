import type { Rule } from "../types";

interface RuleEditorProps {
  rules: Rule[];
  onChange: (rules: Rule[]) => void;
}

export function RuleEditor({ rules, onChange }: RuleEditorProps) {
  const update = (id: number, patch: Partial<Rule>) => onChange(rules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));
  return (
    <div className="panel">
      <h2>Commission rules</h2>
      <div className="stack">
        {rules.map((rule) => (
          <div className="row" key={rule.id}>
            <label style={{ flex: 2 }}>
              {rule.label}
              <input type="number" min={0} max={100} step={0.5} value={rule.rate} onChange={(e) => update(rule.id, { rate: Number(e.target.value) })} aria-label={`Rate ${rule.tier}`} />
            </label>
            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="checkbox" checked={rule.enabled} onChange={(e) => update(rule.id, { enabled: e.target.checked })} aria-label={`Enabled ${rule.tier}`} /> enabled
            </label>
          </div>
        ))}
      </div>
      <p className="muted">Rates are percentages of gross booking value. Suppliers without a matching rule earn no commission until a rule exists.</p>
    </div>
  );
}
