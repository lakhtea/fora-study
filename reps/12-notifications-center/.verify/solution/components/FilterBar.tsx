import type { StatusFilter } from "../types";

const OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

function isStatusFilter(value: string): value is StatusFilter {
  return OPTIONS.some((option) => option.value === value);
}

interface FilterBarProps {
  filter: StatusFilter;
  onChange: (filter: StatusFilter) => void;
}

export function FilterBar({ filter, onChange }: FilterBarProps) {
  return (
    <div className="toolbar">
      <select
        value={filter}
        onChange={(e) => {
          if (isStatusFilter(e.target.value)) onChange(e.target.value);
        }}
        aria-label="Status filter"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
