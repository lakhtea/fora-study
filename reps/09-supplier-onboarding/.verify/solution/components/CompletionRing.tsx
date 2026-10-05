import { useMemo } from "react";
import type { DocumentKind, SupplierDocument } from "../types";

interface CompletionRingProps {
  documents: SupplierDocument[];
  required: DocumentKind[];
}

export function CompletionRing({ documents, required }: CompletionRingProps) {
  const percent = useMemo(() => {
    const received = required.filter((kind) => documents.some((doc) => doc.kind === kind && doc.received)).length;
    return Math.round((received / required.length) * 100);
  }, [documents, required]);

  return (
    <div className="panel" style={{ textAlign: "center" }}>
      <div className="total" aria-label="Completion">
        {percent}%
      </div>
      <div className="muted">
        {required.length} required documents
      </div>
    </div>
  );
}
