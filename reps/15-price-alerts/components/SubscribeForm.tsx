import { useState } from "react";
import type { Booking } from "../types";
import { formatDate, money } from "../../../shared/format";

interface SubscribeFormProps {
  bookings: Booking[];
  onSubscribe: (reference: string) => Promise<void>;
}

export function SubscribeForm({ bookings, onSubscribe }: SubscribeFormProps) {
  const [reference, setReference] = useState("");
  const [preview, setPreview] = useState<Booking | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const lookUp = () => {
    const match = bookings.find((b) => b.reference === Number(reference.trim().replace(/^FORA-/i, "")));
    setPreview(match ?? null);
    setLookupError(match ? null : "No booking with that reference");
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubscribe(reference);
      setReference("");
      setPreview(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Subscribing failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="panel form" onSubmit={() => submit()} aria-label="Subscribe form">
      <h2>Watch a booking</h2>
      <label>
        Booking reference
        <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="FORA-610233" aria-label="Booking reference" />
      </label>
      <div className="row">
        <button type="button" className="secondary" onClick={lookUp} disabled={!reference.trim()}>
          Look up
        </button>
        <button type="submit" className="primary" disabled={submitting || !reference.trim()}>
          {submitting ? "Subscribing" : "Subscribe"}
        </button>
      </div>
      {preview && (
        <div className="notice" aria-label="Booking preview">
          {preview.hotel} for {preview.client}, check-in {formatDate(preview.checkIn)}, paid {money(preview.paidNightly)} a night.
        </div>
      )}
      {lookupError && <div className="error">{lookupError}</div>}
      {submitError && (
        <div className="danger" role="alert">
          {submitError}
        </div>
      )}
    </form>
  );
}
