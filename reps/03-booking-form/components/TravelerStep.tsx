import { useState } from "react";
import type { Traveler } from "../types";

interface TravelerStepProps {
  traveler: Traveler;
  onChange: (traveler: Traveler) => void;
  onNext: () => void;
}

export function validateTraveler(traveler: Traveler): Partial<Record<keyof Traveler, string>> {
  const errors: Partial<Record<keyof Traveler, string>> = {};
  if (!traveler.name.trim()) errors.name = "Name is required";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(traveler.email)) errors.email = "Enter a valid email";
  return errors;
}

export function TravelerStep({ traveler, onChange, onNext }: TravelerStepProps) {
  const [touched, setTouched] = useState<Partial<Record<keyof Traveler, boolean>>>({});
  const errors = validateTraveler(traveler);

  const submit = () => {
    setTouched({ name: true, email: true });
    if (Object.keys(errors).length === 0) onNext();
  };

  return (
    <div className="form">
      <label>
        Lead traveler
        <input value={traveler.name} onChange={(e) => onChange({ ...traveler, name: e.target.value })} onBlur={() => setTouched((t) => ({ ...t, name: true }))} aria-label="Lead traveler" />
        {touched.name && errors.name && <span className="error">{errors.name}</span>}
      </label>
      <label>
        Email
        <input value={traveler.email} onChange={(e) => onChange({ ...traveler, email: e.target.value })} onBlur={() => setTouched((t) => ({ ...t, email: true }))} aria-label="Email" />
        {touched.email && errors.email && <span className="error">{errors.email}</span>}
      </label>
      <div>
        <button type="button" className="primary" onClick={submit}>
          Next: rooms and dates
        </button>
      </div>
    </div>
  );
}
