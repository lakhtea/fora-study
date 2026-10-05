import { useEffect, useState } from "react";
import { fetchDeals } from "./api/client";
import { DealCard } from "./components/DealCard";
import { FeaturedStrip } from "./components/FeaturedStrip";
import { Tray } from "./components/Tray";
import type { Deal, DealCategory } from "./types";

export default function App() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [category, setCategory] = useState<DealCategory | "all">("all");
  const [byDiscount, setByDiscount] = useState(false);
  const [tray, setTray] = useState<Deal[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchDeals().then((rows) => {
      if (!cancelled) setDeals(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = category === "all" ? deals : deals.filter((deal) => deal.category === category);
  const visible = byDiscount ? [...filtered].sort((a, b) => b.discountPercent - a.discountPercent) : filtered;

  const toggleTray = (deal: Deal) => {
    setTray((current) => (current.some((d) => d.id === deal.id) ? current.filter((d) => d.id !== deal.id) : [...current, deal]));
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Supplier deals</h1>
          <div className="muted">{deals.length === 0 ? "Loading" : `${deals.length} active deals`}</div>
        </div>
        <span className="badge pending" aria-label="Tray badge">
          Tray: {tray.length}
        </span>
      </header>
      <div className="toolbar">
        <select value={category} onChange={(e) => setCategory(e.target.value as DealCategory | "all")} aria-label="Category">
          <option value="all">All categories</option>
          <option value="hotel">Hotels</option>
          <option value="cruise">Cruises</option>
          <option value="activity">Activities</option>
        </select>
        <label className="muted" style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" checked={byDiscount} onChange={(e) => setByDiscount(e.target.checked)} aria-label="Sort by discount" /> biggest discount first
        </label>
      </div>
      <div className="layout">
        <div>
          {visible.map((deal) => (
            <DealCard key={deal.id} deal={deal} inTray={tray.some((d) => d.id === deal.id)} onToggle={toggleTray} />
          ))}
        </div>
        <div className="stack">
          <FeaturedStrip deals={deals} />
          <Tray deals={tray} onRemove={toggleTray} />
        </div>
      </div>
    </div>
  );
}
