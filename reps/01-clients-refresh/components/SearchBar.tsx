import { useEffect, useState } from "react";
import type { ClientStatus } from "../types";

interface SearchBarProps {
  status: ClientStatus | "all";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ClientStatus | "all") => void;
}

export function SearchBar({ status, onSearchChange, onStatusChange }: SearchBarProps) {
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => onSearchChange(draft), 300);
    return () => clearTimeout(handle);
  }, [draft, onSearchChange]);

  return (
    <div className="toolbar">
      <input
        type="search"
        placeholder="Search by name, email, or city"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-label="Search clients"
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as ClientStatus | "all")}
        aria-label="Filter by status"
      >
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="prospect">Prospect</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  );
}
