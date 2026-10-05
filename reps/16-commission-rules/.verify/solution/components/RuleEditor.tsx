import { useState } from "react";
import type { Rule } from "../types";

function RateField({ rule, onCommit }: { rule: Rule; onCommit: (rate: number) => void }) {
  const [draft, setDraft] = useState(String(rule.rate));
  return (
    <input
      type="number"
      min={0}
      max={100}
      step={0.5}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const next = Number(draft);
        if (Number.isFinite(next) && next !== rule.rate) onCommit(next);
        else setDraft(String(rule.rate));
      }}
      aria-label={`Rate ${rule.tier}`}
    />
  );
}

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
              <RateField rule={rule} onCommit={(rate) => update(rule.id, { rate })} />
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
