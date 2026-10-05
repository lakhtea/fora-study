import { useEffect, useState } from "react";

interface FiltersProps {
  city: string;
  minStars: number;
  onQueryChange: (query: string) => void;
  onCityChange: (city: string) => void;
  onMinStarsChange: (stars: number) => void;
}

export function Filters({ city, minStars, onQueryChange, onCityChange, onMinStarsChange }: FiltersProps) {
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => onQueryChange(draft), 250);
    return () => clearTimeout(handle);
  }, [draft, onQueryChange]);

  return (
    <div className="toolbar">
      <input type="search" placeholder="Hotel or neighborhood" value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Search hotels" />
      <select value={city} onChange={(e) => onCityChange(e.target.value)} aria-label="City">
        <option value="">All cities</option>
        <option value="Lisbon">Lisbon</option>
        <option value="Paris">Paris</option>
        <option value="Tokyo">Tokyo</option>
      </select>
      <select value={minStars} onChange={(e) => onMinStarsChange(Number(e.target.value))} aria-label="Minimum stars">
        <option value={0}>Any rating</option>
        <option value={3}>3+ stars</option>
        <option value={4}>4+ stars</option>
        <option value={5}>5 stars</option>
      </select>
    </div>
  );
}
