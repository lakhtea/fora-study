import type { ExportJob, Filters } from "../types";
import { formatDate } from "../../../shared/format";

interface ExportPanelProps {
  filters: Filters;
  jobs: ExportJob[];
  onExport: () => void;
}

export function describeFilters(filters: Filters): string {
  const range = filters.from || filters.to ? `${filters.from ? formatDate(filters.from) : "start"} to ${filters.to ? formatDate(filters.to) : "now"}` : "all dates";
  return `${filters.status}, ${range}`;
}

export function ExportPanel({ filters, jobs, onExport }: ExportPanelProps) {
  return (
    <div className="panel">
      <h2>Export</h2>
      <p className="muted">Exports the filtered rows as a CSV to your email. Press E anywhere on the page to start one.</p>
      <button type="button" className="primary" onClick={onExport}>
        Export filtered rows
      </button>
      <div className="muted counter" aria-label="Exports started">
        Exports started: {jobs.length}
      </div>
      <ul className="list" aria-label="Export log">
        {jobs.map((job) => (
          <li key={job.id}>
            <span>Export #{job.id} queued</span>
            <span className="muted">
              {job.rows} rows ({describeFilters(filters)})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
