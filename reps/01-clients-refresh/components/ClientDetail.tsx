import { useEffect, useState } from "react";
import { fetchClientDetail } from "../api/client";
import type { ClientDetail as ClientDetailRecord, Trip } from "../types";
import { formatDate } from "../../../shared/format";

interface ClientDetailProps {
  clientId: number | null;
  tripsByClient: Map<number, Trip[]>;
}

export function ClientDetail({ clientId, tripsByClient }: ClientDetailProps) {
  const [detail, setDetail] = useState<ClientDetailRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clientId === null) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchClientDetail(clientId)
      .then((record) => {
        if (!cancelled) setDetail(record);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (clientId === null) {
    return <div className="panel empty">Select a client to see details.</div>;
  }
  if (loading && !detail) {
    return <div className="panel empty">Loading client</div>;
  }
  if (error) {
    return <div className="panel empty">{error}</div>;
  }
  if (!detail) {
    return null;
  }

  const upcoming = tripsByClient.get(detail.id) ?? [];

  return (
    <div className="panel">
      <h2>
        {detail.firstName} {detail.lastName}
      </h2>
      <div className="muted">{detail.city}</div>
      <dl>
        <dt>Email</dt>
        <dd>{detail.email}</dd>
        <dt>Phone</dt>
        <dd>{detail.phone || "Not on file"}</dd>
        <dt>Client since</dt>
        <dd>{formatDate(detail.createdAt)}</dd>
        <dt>Last trip</dt>
        <dd>{formatDate(detail.lastTripAt)}</dd>
      </dl>
      <h3>Preferences</h3>
      {detail.preferences.length === 0 ? (
        <p className="muted">None recorded</p>
      ) : (
        <ul>
          {detail.preferences.map((pref) => (
            <li key={pref}>{pref}</li>
          ))}
        </ul>
      )}
      <h3>Upcoming trips</h3>
      {upcoming.length === 0 ? (
        <p className="muted">No upcoming trips</p>
      ) : (
        <ul>
          {upcoming.map((trip) => (
            <li key={trip.id}>
              {trip.destination}, {formatDate(trip.startDate)} to {formatDate(trip.endDate)}
            </li>
          ))}
        </ul>
      )}
      <h3>Notes</h3>
      {detail.notes.length === 0 ? (
        <p className="muted">No notes yet</p>
      ) : (
        <ul>
          {detail.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
