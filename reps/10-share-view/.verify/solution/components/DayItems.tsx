import { useEffect, useState } from "react";
import { fetchDayItems } from "../api/client";
import type { DayItem } from "../types";

interface DayItemsProps {
  token: string;
  dayIndex: number;
  heading: string;
}

export function DayItems({ token, dayIndex, heading }: DayItemsProps) {
  const [items, setItems] = useState<DayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [openIds, setOpenIds] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchDayItems(token, dayIndex).then((rows) => {
      if (cancelled) return;
      setItems(rows);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [token, dayIndex]);

  const isOpen = (id: number) => showAll || openIds.includes(id);

  const toggle = (id: number) => setOpenIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));

  return (
    <div className="panel">
      <div className="card-header">
        <h2 aria-label="Day heading">{heading}</h2>
        <label className="muted" style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} aria-label="Show all details" /> show all details
        </label>
      </div>
      {loading && items.length === 0 ? (
        <p className="muted">Loading</p>
      ) : (
        <ul className="list" aria-label="Day items">
          {items.map((item) => (
            <li key={item.id} style={{ flexDirection: "column", alignItems: "stretch" }}>
              <span>
                <strong>{item.time}</strong> {item.title}{" "}
                <button type="button" className="link" onClick={() => toggle(item.id)} aria-label={`Details for ${item.title}`}>
                  {isOpen(item.id) ? "hide" : "details"}
                </button>
              </span>
              {isOpen(item.id) && <span className="muted">{item.detail}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
