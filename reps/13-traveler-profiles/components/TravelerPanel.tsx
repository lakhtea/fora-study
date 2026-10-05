import { useState } from "react";
import type { Traveler } from "../types";
import { formatDate } from "../../../shared/format";
import { needsRenewal } from "./passports";

interface TravelerPanelProps {
  traveler: Traveler;
  tripEnd: string;
  notes: string;
  onNotesChange: (notes: string) => void;
  onSave: () => void;
  saving: boolean;
}

export function TravelerPanel({ traveler, tripEnd, notes, onNotesChange, onSave, saving }: TravelerPanelProps) {
  const [showPassport, setShowPassport] = useState(false);
  const flagged = traveler.passportExpiry !== null && needsRenewal(tripEnd, traveler.passportExpiry);

  if (flagged) {
    const [acknowledged, setAcknowledged] = useState(false);
    return (
      <div className="panel">
        <PanelBody traveler={traveler} notes={notes} onNotesChange={onNotesChange} onSave={onSave} saving={saving} showPassport={showPassport} onTogglePassport={() => setShowPassport((v) => !v)} />
        <div className="danger" role="alert">
          Passport expires {formatDate(traveler.passportExpiry)}, less than six months after the trip ends. Renewal needed before travel.
          <label style={{ display: "block", marginTop: 6 }}>
            <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} aria-label="Acknowledge renewal" /> I've told the client
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <PanelBody traveler={traveler} notes={notes} onNotesChange={onNotesChange} onSave={onSave} saving={saving} showPassport={showPassport} onTogglePassport={() => setShowPassport((v) => !v)} />
    </div>
  );
}

function PanelBody({ traveler, notes, onNotesChange, onSave, saving, showPassport, onTogglePassport }: Omit<TravelerPanelProps, "tripEnd"> & { showPassport: boolean; onTogglePassport: () => void }) {
  return (
    <>
      <h2>{traveler.name}</h2>
      <dl>
        <dt>Relationship</dt>
        <dd>{traveler.relationship}</dd>
        <dt>Passport</dt>
        <dd>
          <button type="button" className="link" onClick={onTogglePassport} aria-label="Toggle passport details">
            {showPassport ? "Hide" : "Show"}
          </button>{" "}
          {showPassport && (traveler.passportExpiry ? `${traveler.passportCountry}, expires ${formatDate(traveler.passportExpiry)}` : "None on file")}
        </dd>
      </dl>
      <div className="form">
        <label>
          Notes
          <textarea rows={4} value={notes} onChange={(e) => onNotesChange(e.target.value)} aria-label="Notes" />
        </label>
        <div>
          <button type="button" className="primary" onClick={onSave} disabled={saving}>
            {saving ? "Saving" : "Save notes"}
          </button>
        </div>
      </div>
    </>
  );
}
