import type { Filters, StatusFilter } from "../types";

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <div className="toolbar">
      <select value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value as StatusFilter })} aria-label="Status">
        <option value="all">All statuses</option>
        <option value="Paid">Paid</option>
        <option value="Pending">Pending</option>
        <option value="Void">Void</option>
      </select>
      <label className="muted">
        Travel from{" "}
        <input type="date" value={filters.from} onChange={(e) => onChange({ ...filters, from: e.target.value })} aria-label="Travel from" />
      </label>
      <label className="muted">
        to{" "}
        <input type="date" value={filters.to} onChange={(e) => onChange({ ...filters, to: e.target.value })} aria-label="Travel to" />
      </label>
      <span className="muted">(inclusive)</span>
    </div>
  );
}
