import type { Filters, StatusFilter } from "../types";

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All statuses" },
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "void", label: "Void" },
  ];
  function isStatusFilter(value: string): value is StatusFilter {
    return STATUS_OPTIONS.some((o) => o.value === value);
  }
  return (
    <div className="toolbar">
      <select
        value={filters.status}
        onChange={(e) => {
          if (isStatusFilter(e.target.value))
            onChange({ ...filters, status: e.target.value });
        }}
        aria-label="Status"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label className="muted">
        Travel from{" "}
        <input
          type="date"
          value={filters.from}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
          aria-label="Travel from"
        />
      </label>
      <label className="muted">
        to{" "}
        <input
          type="date"
          value={filters.to}
          onChange={(e) => onChange({ ...filters, to: e.target.value })}
          aria-label="Travel to"
        />
      </label>
      <span className="muted">(inclusive)</span>
    </div>
  );
}
