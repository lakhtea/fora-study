import { memo, useRef, type CSSProperties } from "react";
import type { DocumentKind, SupplierDocument } from "../types";
import { formatDate } from "../../../shared/format";

interface ChecklistRowProps {
  kind: DocumentKind;
  label: string;
  doc: SupplierDocument | undefined;
  tone: CSSProperties;
  onToggle: (kind: DocumentKind) => void;
}

function expensiveRender(): void {
  const end = performance.now() + 4;
  while (performance.now() < end) {
    // simulates a heavy row (icon rasterization, markdown, etc.)
  }
}

export const ChecklistRow = memo(function ChecklistRow({ kind, label, doc, tone, onToggle }: ChecklistRowProps) {
  const renders = useRef(0);
  renders.current += 1;
  expensiveRender();
  return (
    <li className="item" data-testid={`row-${kind}`} data-renders={renders.current} style={tone}>
      <div className="grow">
        <div>{label}</div>
        <div className="muted">{doc ? `${doc.fileName}, uploaded ${formatDate(doc.uploadedAt)}` : "Not uploaded"}</div>
      </div>
      <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input type="checkbox" checked={doc?.received ?? false} disabled={!doc} onChange={() => onToggle(kind)} aria-label={`Received ${label}`} />
        received
      </label>
    </li>
  );
});
