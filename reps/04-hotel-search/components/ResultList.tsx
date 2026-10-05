import type { Hotel } from "../types";
import { money } from "../../../shared/format";

interface ResultListProps {
  hotels: Hotel[];
  loading: boolean;
  selectedId: number | null;
  shortlistIds: number[];
  onSelect: (id: number) => void;
  onToggleShortlist: (hotel: Hotel) => void;
}

export function ResultList({ hotels, loading, selectedId, shortlistIds, onSelect, onToggleShortlist }: ResultListProps) {
  if (loading && hotels.length === 0) return <div className="empty">Searching</div>;
  if (hotels.length === 0) return <div className="empty">No hotels match.</div>;
  return (
    <table aria-label="Results">
      <thead>
        <tr>
          <th>Hotel</th>
          <th>Stars</th>
          <th>From</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {hotels.map((hotel) => {
          const listed = shortlistIds.includes(hotel.id);
          return (
            <tr key={hotel.id} className={hotel.id === selectedId ? "clickable selected" : "clickable"} onClick={() => onSelect(hotel.id)}>
              <td>
                {hotel.name}
                <div className="muted">
                  {hotel.neighborhood}, {hotel.city}
                </div>
              </td>
              <td>{"\u2605".repeat(hotel.stars)}</td>
              <td>{money(hotel.rate)}</td>
              <td>
                <button
                  type="button"
                  className="link"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleShortlist(hotel);
                  }}
                  aria-label={`${listed ? "Remove" : "Shortlist"} ${hotel.name}`}
                >
                  {listed ? "Remove" : "Shortlist"}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
