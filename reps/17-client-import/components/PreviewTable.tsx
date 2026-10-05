import type { ClientStatus, ImportRow } from "../types";

interface PreviewTableProps {
  rows: ImportRow[];
  existingEmails: Set<string>;
  statusEdits: Record<string, ClientStatus>;
  onStatusChange: (email: string, status: ClientStatus) => void;
}

export function PreviewTable({ rows, existingEmails, statusEdits, onStatusChange }: PreviewTableProps) {
  return (
    <table aria-label="Preview">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>City</th>
          <th>Status</th>
          <th>Check</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const duplicate = existingEmails.has(row.email.toLowerCase());
          return (
            <tr key={row.email} data-testid={`row-${index}`}>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>{row.city}</td>
              <td>
                <select value={statusEdits[row.email] ?? row.status} onChange={(e) => onStatusChange(row.email, e.target.value as ClientStatus)} aria-label={`Status row ${index}`}>
                  <option value="active">active</option>
                  <option value="prospect">prospect</option>
                  <option value="inactive">inactive</option>
                </select>
              </td>
              <td aria-label={`Check row ${index}`}>{duplicate ? <span className="badge inactive">already a client</span> : <span className="badge active">new</span>}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
