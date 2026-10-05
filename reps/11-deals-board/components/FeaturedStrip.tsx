import type { Deal } from "../types";

export function FeaturedStrip({ deals }: { deals: Deal[] }) {
  const featured = deals.slice(0, 3);
  return (
    <div className="panel">
      <h2>Featured this week</h2>
      <ol aria-label="Featured deals" style={{ margin: 0, paddingLeft: 18 }}>
        {featured.map((deal) => (
          <li key={deal.id}>
            {deal.supplier} <span className="muted">{deal.headline}</span>
          </li>
        ))}
      </ol>
      <p className="muted">Hand-picked by the supplier team; shown in the order they chose.</p>
    </div>
  );
}
