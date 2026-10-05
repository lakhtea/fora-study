import type { ExpiryById, Traveler } from "../types";
import { daysUntil, needsRenewal } from "./passports";

interface TravelerListProps {
  travelers: Traveler[];
  expiryById: ExpiryById;
  tripEnd: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function TravelerList({ travelers, expiryById, tripEnd, selectedId, onSelect }: TravelerListProps) {
  return (
    <ul className="list" aria-label="Travelers">
      {travelers.map((traveler) => {
        const flagged = traveler.passportExpiry !== null && needsRenewal(tripEnd, traveler.passportExpiry);
        return (
          <li key={traveler.id} className={traveler.id === selectedId ? "selected" : undefined}>
            <span>
              <button type="button" className="link" onClick={() => onSelect(traveler.id)} aria-label={`Open ${traveler.name}`}>
                {traveler.name}
              </button>{" "}
              <span className="muted">{traveler.relationship}</span>
            </span>
            <span>
              <span className="muted" aria-label={`Passport ${traveler.name}`}>
                {expiryById[traveler.id] !== undefined ? `${daysUntil(expiryById[traveler.id] as string)} days left` : "No passport on file"}
              </span>{" "}
              {flagged && <span className="badge pending" aria-label={`Renewal ${traveler.name}`}>renew</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
