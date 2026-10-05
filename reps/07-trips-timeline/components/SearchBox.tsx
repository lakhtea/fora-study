import { useEffect, useState } from "react";

interface SearchBoxProps {
  onSearch: (query: string) => void;
}

export function SearchBox({ onSearch }: SearchBoxProps) {
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setTimeout(() => onSearch(draft), 300);
  }, [draft, onSearch]);

  return (
    <div className="toolbar">
      <input type="search" placeholder="Client, destination, or hotel" value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Search trips" />
    </div>
  );
}
