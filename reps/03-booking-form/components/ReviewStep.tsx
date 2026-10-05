import { useEffect, useState } from "react";
import { createBooking, fetchQuote } from "../api/client";
import type { Confirmation, Quote, Room, Traveler } from "../types";
import { formatDate, moneyCents } from "../../../shared/format";

interface ReviewStepProps {
  traveler: Traveler;
  checkIn: string;
  checkOut: string;
  rooms: Room[];
  onBack: () => void;
}

export function ReviewStep({ traveler, checkIn, checkOut, rooms, onBack }: ReviewStepProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchQuote(checkIn, checkOut, rooms).then((result) => {
      if (cancelled) return;
      setQuote(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [checkIn, checkOut, rooms]);

  const nightlyTotal = quote?.nightlyTotal ?? 0;
  const taxes = quote?.taxes ?? 0;
  const total = quote?.total ?? 0;

  const confirm = async () => {
    setSubmitting(true);
    try {
      setConfirmation(await createBooking(traveler, checkIn, checkOut, rooms, total));
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <div className="notice" role="status">
        Booking confirmed. Reference {confirmation.reference}, total {moneyCents(confirmation.total)}.
      </div>
    );
  }

  return (
    <div className="form">
      <dl className="panel">
        <dt>Traveler</dt>
        <dd>
          {traveler.name} ({traveler.email})
        </dd>
        <dt>Dates</dt>
        <dd>
          {formatDate(checkIn)} to {formatDate(checkOut)}
        </dd>
        <dt>Rooms</dt>
        <dd>{rooms.map((r, i) => `Room ${i + 1}: ${r.type}, ${r.guests} guests`).join("; ")}</dd>
        <dt>Per night</dt>
        <dd>{loading ? "Pricing" : moneyCents(nightlyTotal)}</dd>
        <dt>Taxes</dt>
        <dd>{loading ? "Pricing" : moneyCents(taxes)}</dd>
        <dt>Total</dt>
        <dd className="total" aria-label="Quote total">
          {loading ? "Pricing" : moneyCents(total)}
        </dd>
      </dl>
      <div className="row">
        <button type="button" className="secondary" onClick={onBack}>
          Back
        </button>
        <button type="button" className="primary" onClick={confirm} disabled={loading || submitting}>
          {submitting ? "Confirming" : "Confirm booking"}
        </button>
      </div>
    </div>
  );
}
