import { useEffect, useState } from "react";
import { fetchHousehold, saveNotes } from "./api/client";
import { TravelerList } from "./components/TravelerList";
import { TravelerPanel } from "./components/TravelerPanel";
import type { ExpiryById, Household } from "./types";
import { formatDate } from "../../shared/format";

export default function App() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notesById, setNotesById] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchHousehold(101).then((data) => {
      if (cancelled) return;
      setHousehold(data);
      setSelectedId(data.travelers[0]?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!household) return <div className="page muted">Loading travelers</div>;

  const expiryById: ExpiryById = Object.fromEntries(household.travelers.filter((t) => t.passportExpiry).map((t) => [t.id, t.passportExpiry as string]));
  const traveler = household.travelers.find((t) => t.id === selectedId) ?? null;
  const notes = traveler ? (notesById[traveler.id] ?? traveler.notes) : "";

  const handleSave = async () => {
    if (!traveler) return;
    setSaving(true);
    const saved = await saveNotes(traveler.id, notes);
    setHousehold((current) => (current ? { ...current, travelers: current.travelers.map((t) => (t.id === saved.id ? saved : t)) } : current));
    setSaving(false);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Travelers: {household.clientName}</h1>
          <div className="muted">
            Trip ends {formatDate(household.tripEnd)}. Passports must be valid at least six months beyond that.
          </div>
        </div>
      </header>
      <div className="layout">
        <TravelerList travelers={household.travelers} expiryById={expiryById} tripEnd={household.tripEnd} selectedId={selectedId} onSelect={setSelectedId} />
        {traveler ? (
          <TravelerPanel
            traveler={traveler}
            tripEnd={household.tripEnd}
            notes={notes}
            onNotesChange={(value) => setNotesById((current) => ({ ...current, [traveler.id]: value }))}
            onSave={handleSave}
            saving={saving}
          />
        ) : (
          <div className="panel empty">Pick a traveler.</div>
        )}
      </div>
    </div>
  );
}
