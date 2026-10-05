import type { Hotel } from "../types";
import { money, moneyCents } from "../../../shared/format";

export function Shortlist({ hotels, onRemove }: { hotels: Hotel[]; onRemove: (id: number) => void }) {
  const nightly = hotels.reduce((sum, hotel) => sum + hotel.rate, 0);
  return (
    <div className="panel">
      <h2>Shortlist for the Castellanos</h2>
      {hotels.length === 0 ? (
        <p className="muted">Shortlist hotels from the results to compare them.</p>
      ) : (
        <ul className="list" aria-label="Shortlist">
          {hotels.map((hotel) => (
            <li key={hotel.id}>
              <span>{hotel.name}</span>
              <span>
                {money(hotel.rate)}{" "}
                <button type="button" className="link" onClick={() => onRemove(hotel.id)} aria-label={`Drop ${hotel.name}`}>
                  Drop
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="total" aria-label="Shortlist nightly total">
        {hotels.length === 0 ? "" : moneyCents(nightly)}
      </div>
      {hotels.length > 0 && <div className="muted">Combined nightly rate if the client books all of them.</div>}
    </div>
  );
}
