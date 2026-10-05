import type { Deal } from "../types";

interface TrayProps {
  deals: Deal[];
  onRemove: (deal: Deal) => void;
}

export function Tray({ deals, onRemove }: TrayProps) {
  return (
    <div className="panel">
      <h2>Tray for the Castellanos ({deals.length})</h2>
      {deals.length === 0 ? (
        <p className="muted">Add deals to send them in one email.</p>
      ) : (
        <ul className="list" aria-label="Tray list">
          {deals.map((deal) => (
            <li key={deal.id}>
              <span>{deal.supplier}</span>
              <button type="button" className="link" onClick={() => onRemove(deal)} aria-label={`Drop ${deal.supplier}`}>
                Drop
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
