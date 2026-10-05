import { useEffect, useState } from "react";
import { createAlert, fetchAlerts, fetchBookings } from "./api/client";
import { AlertTable } from "./components/AlertTable";
import { SubscribeForm } from "./components/SubscribeForm";
import type { Booking, PriceAlert } from "./types";
import { money } from "../../shared/format";

export default function App() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchAlerts(), fetchBookings()]).then(([loadedAlerts, loadedBookings]) => {
      if (cancelled) return;
      setAlerts(loadedAlerts);
      setBookings(loadedBookings);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const savings = alerts.reduce((sum, a) => sum + Math.max(0, a.paidNightly - a.currentNightly), 0);

  const handleSubscribe = async (reference: string) => {
    const alert = await createAlert(reference);
    setAlerts((current) => [...current, alert]);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Price Drop</h1>
          <div className="muted" aria-label="Summary">
            {loaded ? `${alerts.length} bookings watched, ${money(savings)} a night in drops found` : "Loading"}
          </div>
        </div>
      </header>
      <div className="layout">
        <AlertTable alerts={alerts} />
        <SubscribeForm bookings={bookings} onSubscribe={handleSubscribe} />
      </div>
    </div>
  );
}
