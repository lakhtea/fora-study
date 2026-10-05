import type { DocumentKind, SupplierDocument } from "../types";
import { KIND_LABELS } from "../types";
import { formatDate } from "../../../shared/format";

interface ReviewPanelProps {
  documents: SupplierDocument[];
  required: DocumentKind[];
  reviewKind: DocumentKind | "";
  onPick: (kind: DocumentKind | "") => void;
}

export function ReviewPanel({ documents, required, reviewKind, onPick }: ReviewPanelProps) {
  const doc = reviewKind === "" ? null : documents.find((candidate) => candidate.kind === reviewKind);
  const uploaded = new Set(documents.map((candidate) => candidate.kind));
  return (
    <div className="panel">
      <h2>Document review</h2>
      <div className="toolbar">
        <select value={reviewKind} onChange={(e) => onPick(e.target.value as DocumentKind | "")} aria-label="Document to review">
          <option value="">Pick a required document</option>
          {required.map((kind) => (
            <option key={kind} value={kind}>
              {KIND_LABELS[kind]}
              {uploaded.has(kind) ? "" : " (missing)"}
            </option>
          ))}
        </select>
      </div>
      {reviewKind === "" ? (
        <p className="muted">Pick a document to see its details.</p>
      ) : !doc ? (
        <p className="danger">{KIND_LABELS[reviewKind]} has not been uploaded yet. Ask the supplier for it before submitting.</p>
      ) : (
        <dl aria-label="Review details">
          <dt>File</dt>
          <dd>{doc.fileName}</dd>
          <dt>Uploaded</dt>
          <dd>{formatDate(doc.uploadedAt)}</dd>
          <dt>Status</dt>
          <dd>{doc.received ? "Received" : "Awaiting review"}</dd>
        </dl>
      )}
    </div>
  );
}
