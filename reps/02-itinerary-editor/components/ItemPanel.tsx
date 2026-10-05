import type { ItineraryItem } from "../types";
import { formatDate, money } from "../../../shared/format";

interface ItemPanelProps {
  items: ItineraryItem[];
  days: string[];
  selectedItemId: number | null;
}

export function ItemPanel({ items, days, selectedItemId }: ItemPanelProps) {
  if (selectedItemId === null) {
    return <div className="panel empty">Select an item to see its details.</div>;
  }
  const item = items.find((candidate) => candidate.id === selectedItemId)!;
  return (
    <div className="panel">
      <h2>{item.title}</h2>
      <dl>
        <dt>Day</dt>
        <dd>
          Day {item.dayIndex + 1}, {formatDate(days[item.dayIndex])}
        </dd>
        <dt>Price</dt>
        <dd>{money(item.price)}</dd>
        <dt>Supplier id</dt>
        <dd>{item.supplierId}</dd>
        <dt>Note</dt>
        <dd>{item.note || "None"}</dd>
      </dl>
    </div>
  );
}
