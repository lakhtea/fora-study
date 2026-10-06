import { useCallback, useEffect, useState } from "react";
import { searchHotels } from "./api/client";
import { Filters } from "./components/Filters";
import { HotelPanel } from "./components/HotelPanel";
import { ResultList } from "./components/ResultList";
import { Shortlist } from "./components/Shortlist";
import type { Hotel } from "./types";

export default function App() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [minStars, setMinStars] = useState(0);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [shortlist, setShortlist] = useState<Hotel[]>([]);

  const filters = { query, city, minStars };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    searchHotels(filters).then((page) => {
      if (cancelled) return;
      setHotels(page.results);
      setTotal(page.total);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [query, city, minStars]);

  const handleQueryChange = useCallback((value: string) => setQuery(value), []);

  const toggleShortlist = (hotel: Hotel) => {
    setShortlist((current) =>
      current.some((h) => h.id === hotel.id)
        ? current.filter((h) => h.id !== hotel.id)
        : [...current, hotel],
    );
  };

  const scope = [
    city || "all cities",
    minStars ? `${minStars}+ stars` : "any rating",
  ].join(", ");

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Hotel search</h1>
          <div className="muted" aria-label="Result count">
            {loading ? "Searching" : `${total} hotels`} ({scope})
          </div>
        </div>
      </header>
      <Filters
        city={city}
        minStars={minStars}
        onQueryChange={handleQueryChange}
        onCityChange={setCity}
        onMinStarsChange={setMinStars}
      />
      <div className="layout">
        <ResultList
          hotels={hotels}
          loading={loading}
          selectedId={selectedId}
          shortlistIds={shortlist.map((h) => h.id)}
          onSelect={setSelectedId}
          onToggleShortlist={toggleShortlist}
        />
        <div className="stack">
          <HotelPanel hotelId={selectedId} />
          <Shortlist
            hotels={shortlist}
            onRemove={(id) =>
              setShortlist((current) => current.filter((h) => h.id !== id))
            }
          />
        </div>
      </div>
    </div>
  );
}
