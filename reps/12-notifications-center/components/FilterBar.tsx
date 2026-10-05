import type { StatusFilter } from "../types";

interface FilterBarProps {
  filter: StatusFilter;
  onChange: (filter: StatusFilter) => void;
}

export function FilterBar({ filter, onChange }: FilterBarProps) {
  return (
    <div className="toolbar">
      <select value={filter} onChange={(e) => onChange(e.target.value as StatusFilter)} aria-label="Status filter">
        <option value="all">All</option>
        <option value="Unread">Unread</option>
        <option value="Read">Read</option>
      </select>
    </div>
  );
}
