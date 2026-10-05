import type { Deal } from "../types";

interface DealCardProps {
  deal: Deal;
  inTray: boolean;
  onToggle: (deal: Deal) => void;
}

export function DealCard({ deal, inTray, onToggle }: DealCardProps) {
  return (
    <div className="card" data-testid={`deal-${deal.id}`}>
      <div className="card-header">
        <h3>{deal.supplier}</h3>
        <span className="badge confirmed">{deal.discountPercent}% off</span>
      </div>
      <div>{deal.headline}</div>
      <div className="muted">
        {deal.city}, {deal.category}. <span aria-label={`Validity ${deal.supplier}`}>{`Valid until ${deal.validUntil}`}</span>. {deal.perks.join(", ")}.
      </div>
      <button type="button" className="link" onClick={() => onToggle(deal)} aria-label={`${inTray ? "Remove" : "Add"} ${deal.supplier}`}>
        {inTray ? "Remove from tray" : "Add to tray"}
      </button>
    </div>
  );
}
