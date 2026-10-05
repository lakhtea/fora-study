import { useEffect, useState } from "react";
import { fetchOnboarding, fetchRequirements } from "./api/client";
import { ChecklistRow } from "./components/ChecklistRow";
import { CompletionRing } from "./components/CompletionRing";
import { ReviewPanel } from "./components/ReviewPanel";
import type { DocumentKind, OnboardingRecord, Requirements, SupplierType } from "./types";
import { KIND_LABELS } from "./types";

export default function App() {
  const [record, setRecord] = useState<OnboardingRecord | null>(null);
  const [requirements, setRequirements] = useState<Requirements | null>(null);
  const [reviewKind, setReviewKind] = useState<DocumentKind | "">("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchOnboarding(501), fetchRequirements()]).then(([loaded, reqs]) => {
      if (cancelled) return;
      setRecord(loaded);
      setRequirements(reqs);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!record || !requirements) return <div className="page muted">Loading onboarding</div>;

  const required = requirements[record.type];
  const toggle = (kind: DocumentKind) => {
    setRecord((current) =>
      current ? { ...current, documents: current.documents.map((doc) => (doc.kind === kind ? { ...doc, received: !doc.received } : doc)) } : current
    );
  };
  const complete = required.every((kind) => record.documents.some((doc) => doc.kind === kind && doc.received));

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Supplier onboarding</h1>
          <div className="muted">{record.contact}</div>
        </div>
        <button type="button" className="primary" disabled={!complete} aria-label="Submit onboarding">
          Submit for approval
        </button>
      </header>
      <div className="layout">
        <div className="stack">
          <div className="panel form">
            <label>
              Supplier name
              <input value={record.name} onChange={(e) => setRecord({ ...record, name: e.target.value })} aria-label="Supplier name" />
            </label>
            <label>
              Supplier type
              <select value={record.type} onChange={(e) => setRecord({ ...record, type: e.target.value as SupplierType })} aria-label="Supplier type">
                <option value="hotel">Hotel</option>
                <option value="activity">Activity</option>
                <option value="transfer">Transfer</option>
              </select>
            </label>
          </div>
          <div className="panel">
            <h2>Required documents</h2>
            <ul className="list" aria-label="Checklist">
              {required.map((kind) => {
                const doc = record.documents.find((candidate) => candidate.kind === kind);
                return (
                  <ChecklistRow
                    key={kind}
                    kind={kind}
                    label={KIND_LABELS[kind]}
                    doc={doc}
                    tone={{ opacity: doc?.received ? 1 : 0.75 }}
                    onToggle={() => toggle(kind)}
                  />
                );
              })}
            </ul>
          </div>
        </div>
        <div className="stack">
          <CompletionRing documents={record.documents} required={required} />
          <ReviewPanel documents={record.documents} required={required} reviewKind={reviewKind} onPick={setReviewKind} />
        </div>
      </div>
    </div>
  );
}
