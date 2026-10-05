import type { Notification } from "../types";

interface NotificationListProps {
  items: Notification[];
  onMarkRead: (id: number) => void;
}

const TYPE_LABEL: Record<Notification["type"], string> = {
  price_drop: "Price drop",
  booking: "Booking",
  message: "Message",
  payout: "Payout",
};

export function NotificationList({ items, onMarkRead }: NotificationListProps) {
  if (items.length === 0) return <div className="empty">No notifications here.</div>;
  return (
    <ul className="list" aria-label="Notifications">
      {items.map((item) => (
        <li key={item.id} style={{ fontWeight: item.status === "unread" ? 600 : 400 }}>
          <span>
            <span className={`badge ${item.type === "price_drop" ? "confirmed" : ""}`}>{TYPE_LABEL[item.type]}</span> {item.title}
            <div className="muted" style={{ fontWeight: 400 }}>
              {item.body}
            </div>
          </span>
          <span>
            {item.status === "unread" ? (
              <button type="button" className="link" onClick={() => onMarkRead(item.id)} aria-label={`Mark read ${item.id}`}>
                Mark read
              </button>
            ) : (
              <span className="muted">read</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
