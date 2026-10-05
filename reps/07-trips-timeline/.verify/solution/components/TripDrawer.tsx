import type { Trip } from "../types";
import { formatDate, money } from "../../../shared/format";

interface TripDrawerProps {
  trip: Trip;
  onClose: () => void;
}

export function TripDrawer({ trip, onClose }: TripDrawerProps) {
  return (
    <div className="panel" aria-label="Trip drawer">
      <div className="card-header">
        <h2>
          {trip.destination} for {trip.clientName}
        </h2>
        <button type="button" className="secondary" onClick={onClose} aria-label="Close drawer">
          Close
        </button>
      </div>
      <dl>
        <dt>Dates</dt>
        <dd aria-label="Drawer dates">
          {formatDate(trip.startDate)} to {formatDate(trip.endDate)}
        </dd>
        <dt>Hotel</dt>
        <dd>{trip.hotel}</dd>
        <dt>Status</dt>
        <dd>{trip.status}</dd>
        <dt>Total</dt>
        <dd>{money(trip.total)}</dd>
      </dl>
    </div>
  );
}
