import type { ItineraryItem } from "../types";
import { formatDate, money } from "../../../shared/format";

interface DayListProps {
  days: string[];
  items: ItineraryItem[];
  selectedItemId: number | null;
  onSelect: (id: number) => void;
  onRemove: (id: number) => void;
  onMove: (id: number, direction: -1 | 1) => void;
  onNoteBlur: (id: number, note: string) => void;
}

export function DayList({
  days,
  items,
  selectedItemId,
  onSelect,
  onRemove,
  onMove,
  onNoteBlur,
}: DayListProps) {
  return (
    <div className="stack">
      {days.map((date, dayIndex) => {
        const dayItems = items.filter((item) => item.dayIndex === dayIndex);
        const dayTotal = dayItems.reduce((sum, item) => sum + item.price, 0);
        return (
          <div className="card" key={date}>
            <div className="card-header">
              <h3>
                Day {dayIndex + 1}: {formatDate(date)}
              </h3>
              <span className="muted">{money(dayTotal)}</span>
            </div>
            {dayItems.length === 0 && (
              <div className="muted">Nothing planned yet.</div>
            )}
            {dayItems.map((item, index) => (
              <div
                className="item"
                key={item.id}
                data-testid={`item-${item.id}`}
              >
                <button
                  type="button"
                  className="link"
                  onClick={() => onSelect(item.id)}
                  aria-label={`Open ${item.title}`}
                >
                  {item.id === selectedItemId ? "\u25CF" : "\u25CB"}
                </button>
                <div className="grow">
                  <div>{item.title}</div>
                  <div className="muted">{money(item.price)}</div>
                </div>
                <textarea
                  rows={1}
                  defaultValue={item.note}
                  placeholder="Note"
                  aria-label={`Note for ${item.title}`}
                  onBlur={(e) => onNoteBlur(item.id, e.target.value)}
                />
                <button
                  type="button"
                  className="secondary"
                  onClick={() => onMove(item.id, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${item.title} up`}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => onMove(item.id, 1)}
                  disabled={index === dayItems.length - 1}
                  aria-label={`Move ${item.title} down`}
                >
                  Down
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${item.title}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
