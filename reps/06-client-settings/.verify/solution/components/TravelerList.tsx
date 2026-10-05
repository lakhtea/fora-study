import { useState } from "react";
import type { Traveler, TravelerDirectory } from "../types";

interface TravelerListProps {
  travelerIds: number[];
  directory: TravelerDirectory;
  onChange: (travelerIds: number[]) => void;
}

export function TravelerList({ travelerIds, directory, onChange }: TravelerListProps) {
  const [pick, setPick] = useState("");
  const available = Object.values(directory).filter((t): t is Traveler => t !== undefined && !travelerIds.includes(t.id));

  return (
    <div>
      <h3>Linked travelers ({travelerIds.length})</h3>
      <ul className="list" aria-label="Linked travelers">
        {travelerIds.map((id) => {
          const traveler = directory[id];
          const label = traveler ? traveler.name : `Archived traveler (#${id})`;
          return (
            <li key={id}>
              <span>
                {label} <span className="muted">{traveler ? traveler.relationship : "no longer in your directory"}</span>
              </span>
              <button type="button" className="link" onClick={() => onChange(travelerIds.filter((t) => t !== id))} aria-label={`Unlink ${label}`}>
                Unlink
              </button>
            </li>
          );
        })}
      </ul>
      <div className="row">
        <select value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Traveler to link">
          <option value="">Pick a traveler</option>
          {available.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="secondary"
          disabled={!pick}
          onClick={() => {
            onChange([...travelerIds, Number(pick)]);
            setPick("");
          }}
        >
          Link
        </button>
      </div>
    </div>
  );
}
