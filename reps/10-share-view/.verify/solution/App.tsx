import { useEffect, useState } from "react";
import { fetchShare } from "./api/client";
import { DayItems } from "./components/DayItems";
import { DayPicker } from "./components/DayPicker";
import { ShareHeader } from "./components/ShareHeader";
import type { ShareView } from "./types";

const PREVIEW_TOKENS = [
  { token: "maya-2026", label: "Maya's Lisbon link" },
  { token: "expired-77", label: "Chloe's Paris link (expired)" },
];

export default function App() {
  const [token, setToken] = useState(PREVIEW_TOKENS[0].token);
  const [share, setShare] = useState<ShareView | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setUnavailable(null);
    fetchShare(token)
      .then((view) => {
        if (cancelled) return;
        setShare(view);
        setSelectedDay(0);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setShare(null);
        setUnavailable(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const days = share?.days ?? [];
  const day = days[selectedDay];

  return (
    <div className="page">
      <div className="toolbar">
        <label className="muted">
          Preview as{" "}
          <select value={token} onChange={(e) => setToken(e.target.value)} aria-label="Preview link">
            {PREVIEW_TOKENS.map((p) => (
              <option key={p.token} value={p.token}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading ? (
        <div className="empty">Loading your itinerary</div>
      ) : unavailable ? (
        <div className="danger" role="alert">
          {unavailable}
        </div>
      ) : (
        <>
          <ShareHeader title={share?.title ?? "Your itinerary"} clientName={share?.clientName ?? "you"} token={token} />
          <DayPicker days={days} selected={selectedDay} onSelect={setSelectedDay} />
          <div className="layout">
            {day ? <DayItems token={token} dayIndex={day.index} heading={`Day ${day.index + 1}: ${day.label}`} /> : <div className="panel empty">No days planned yet.</div>}
            <div className="panel">
              <h2>Your advisor</h2>
              <p>{share?.advisor.name ?? "Your Fora advisor"}</p>
              <p className="muted">{share?.advisor.email ?? ""}</p>
              <p className="muted">{share?.advisor.phone ?? ""}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
