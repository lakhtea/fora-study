import { useEffect, useState } from "react";
import { fetchContacts, saveContacts } from "./api/client";
import { ContactRow } from "./components/ContactRow";
import { mergeContact } from "./components/merge";
import { SaveBar } from "./components/SaveBar";
import type { ContactEdits, SupplierContacts } from "./types";

export default function App() {
  const [data, setData] = useState<SupplierContacts | null>(null);
  const [edits, setEdits] = useState<ContactEdits>({});
  const [primaryId, setPrimaryId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchContacts().then((loaded) => {
      if (cancelled) return;
      setData(loaded);
      setPrimaryId(loaded.primaryId);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data || primaryId === null) return <div className="page muted">Loading contacts</div>;

  const dirty = Object.keys(edits).length > 0 || primaryId !== data.primaryId;
  const primary = mergeContact(data.contacts.find((c) => c.id === primaryId) ?? data.contacts[0], edits);

  const handleEdit = (id: number, field: "phone" | "email", value: string) => {
    setEdits((current) => ({ ...current, [id]: { ...current[id], [field]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    const saved = await saveContacts({ ...data, primaryId, contacts: data.contacts.map((c) => mergeContact(c, edits)) });
    setData(saved);
    setEdits({});
    setSavedAt(new Date().toLocaleTimeString());
    setSaving(false);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>{data.supplier}: contacts</h1>
          <div className="muted">Edit phone and email inline; pick the primary contact; save when done.</div>
        </div>
      </header>
      <div className="layout">
        <div className="stack">
          {data.contacts.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              phone={edits[contact.id]?.phone ?? contact.phone}
              email={edits[contact.id]?.email ?? contact.email}
              isPrimary={contact.id === primaryId}
              onChange={() => setPrimaryId(contact.id)}
              onEdit={handleEdit}
            />
          ))}
          <SaveBar dirty={dirty} saving={saving} savedAt={savedAt} onSave={handleSave} />
        </div>
        <div className="panel" aria-label="Primary preview">
          <h2>Primary contact card</h2>
          <p>
            <strong>{primary.name}</strong>, {primary.role}
          </p>
          <p aria-label="Preview phone">{primary.phone}</p>
          <p className="muted" aria-label="Preview email">
            {primary.email}
          </p>
          <p className="muted">This is what clients see on the itinerary.</p>
        </div>
      </div>
    </div>
  );
}
