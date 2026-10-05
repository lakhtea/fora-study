import { useState } from "react";
import { saveSettings } from "../api/client";
import type { ClientSettings, TravelerDirectory } from "../types";
import { TravelerList } from "./TravelerList";

interface SettingsFormProps {
  settings: ClientSettings;
  directory: TravelerDirectory;
  onSaved: (settings: ClientSettings) => void;
}

function isDirty(a: ClientSettings, b: ClientSettings): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}

export function SettingsForm({ settings, directory, onSaved }: SettingsFormProps) {
  const [form, setForm] = useState<ClientSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const dirty = isDirty(form, settings);

  const handleSave = () => {
    setSaving(true);
    saveSettings(form)
      .then((saved) => {
        setSaving(false);
        setSavedAt(new Date().toLocaleTimeString());
        onSaved(saved);
      })
      .catch(console.error);
  };

  return (
    <div className="panel">
      <div className="card-header">
        <h2>{settings.name}</h2>
        <span className="muted" aria-label="Save state">
          {saving ? "Saving" : dirty ? "Unsaved changes" : savedAt ? `Saved at ${savedAt}` : "Up to date"}
        </span>
      </div>
      <div className="muted" aria-label="Household">
        Household: {settings.travelerIds.map((id) => directory[id].name).join(", ") || "just the client"}
      </div>
      <div className="form">
        <label>
          Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label="Name" />
        </label>
        <label>
          Phone
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} aria-label="Phone" />
        </label>
        <label>
          Currency
          <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as ClientSettings["currency"] })} aria-label="Currency">
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </label>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="muted">Preferences</legend>
          {(["newsletter", "whatsapp", "priceAlerts"] as const).map((key) => (
            <label key={key} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={form.preferences[key]} onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, [key]: e.target.checked } })} aria-label={key} />
              {key}
            </label>
          ))}
        </fieldset>
        <TravelerList travelerIds={form.travelerIds} directory={directory} onChange={(travelerIds) => setForm({ ...form, travelerIds })} />
        <div>
          <button type="button" className="primary" onClick={handleSave} disabled={saving || !dirty}>
            {saving ? "Saving" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
