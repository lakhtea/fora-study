import type { ClientStatus, ImportRow } from "../types";

interface PreviewTableProps {
  rows: ImportRow[];
  existingEmails: Set<string>;
  duplicateRowIds: Set<number>;
  statusEdits: Record<number, ClientStatus>;
  onStatusChange: (rowId: number, status: ClientStatus) => void;
}

export function PreviewTable({ rows, existingEmails, duplicateRowIds, statusEdits, onStatusChange }: PreviewTableProps) {
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
          const existing = existingEmails.has(row.email.toLowerCase());
          const repeated = duplicateRowIds.has(row.rowId);
          return (
            <tr key={row.rowId} data-testid={`row-${index}`}>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>{row.city}</td>
              <td>
                <select value={statusEdits[row.rowId] ?? row.status} onChange={(e) => onStatusChange(row.rowId, e.target.value as ClientStatus)} aria-label={`Status row ${index}`}>
                  <option value="active">active</option>
                  <option value="prospect">prospect</option>
                  <option value="inactive">inactive</option>
                </select>
              </td>
              <td aria-label={`Check row ${index}`}>
                {existing ? <span className="badge inactive">already a client</span> : repeated ? <span className="badge pending">duplicate in paste</span> : <span className="badge active">new</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
