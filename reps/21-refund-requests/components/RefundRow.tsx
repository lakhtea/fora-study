import type { RefundRequest } from "../types";
import { formatDate, money } from "../../../shared/format";

interface RefundRowProps {
  request: RefundRequest;
  busy: boolean;
  onDecide: (id: number, decision: "approved" | "denied") => void;
  onNoteBlur: (id: number, note: string) => void;
}

export function RefundRow({ request, busy, onDecide, onNoteBlur }: RefundRowProps) {
  return (
    <div className="card" data-testid={`refund-${request.id}`}>
      <div className="card-header">
        <h3>
          {request.client} <span className="muted">{request.booking}</span>
        </h3>
        <span className={`badge ${request.status === "pending" ? "pending" : request.status === "approved" ? "confirmed" : "void"}`}>{request.status}</span>
      </div>
      <div>
        {money(request.amount)}: {request.reason}
      </div>
      <div className="muted">Requested {formatDate(request.requestedAt)}</div>
      <div className="item">
        <textarea rows={1} defaultValue={request.note} placeholder="Internal note" aria-label={`Note ${request.client}`} onBlur={(e) => onNoteBlur(request.id, e.target.value)} style={{ flex: 1 }} />
        {request.status === "pending" && (
          <>
            <button type="button" className="primary" disabled={busy} onClick={() => onDecide(request.id, "approved")} aria-label={`Approve ${request.client}`}>
              {busy ? "Working" : "Approve"}
            </button>
            <button type="button" className="secondary" disabled={busy} onClick={() => onDecide(request.id, "denied")} aria-label={`Deny ${request.client}`}>
              Deny
            </button>
          </>
        )}
      </div>
    </div>
  );
}
