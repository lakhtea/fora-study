import { useEffect, useState } from "react";
import { RefundError, decideRefund, fetchRefunds, saveNote } from "./api/client";
import { RefundRow } from "./components/RefundRow";
import type { RefundRequest, RefundStatus } from "./types";
import { money } from "../../shared/format";

export default function App() {
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [filter, setFilter] = useState<RefundStatus | "all">("pending");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchRefunds().then((rows) => {
      if (!cancelled) setRequests(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const pendingTotal = requests.filter((r) => r.status === "pending").reduce((sum, r) => sum + r.amount, 0);

  const handleDecide = async (id: number, decision: "approved" | "denied") => {
    setBusyId(id);
    setError(null);
    try {
      const updated = await decideRefund(id, decision);
      setRequests((current) => current.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deciding failed");
      if (err instanceof RefundError && err.status === 409) setRequests(await fetchRefunds());
    } finally {
      setBusyId(null);
    }
  };

  const handleNoteBlur = async (id: number, note: string) => {
    setError(null);
    try {
      const updated = await saveNote(id, note);
      setRequests((current) => current.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saving the note failed");
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Refund requests</h1>
          <div className="muted" aria-label="Pending summary">
            {requests.filter((r) => r.status === "pending").length} pending, {money(pendingTotal)}
          </div>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as RefundStatus | "all")} aria-label="Status filter">
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
          <option value="all">All</option>
        </select>
      </header>
      {error && (
        <div className="danger" role="alert">
          {error}
        </div>
      )}
      <div className="stack" aria-label="Refund list">
        {visible.length === 0 && <div className="empty">Nothing here.</div>}
        {visible.map((request) => (
          <RefundRow key={request.id} request={request} busy={busyId === request.id} onDecide={handleDecide} onNoteBlur={handleNoteBlur} />
        ))}
      </div>
    </div>
  );
}
