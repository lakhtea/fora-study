import type { Client, SortKey } from "../types";
import { formatDate, money } from "../../../shared/format";

interface ClientTableProps {
  clients: Client[];
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  selectedId: number | null;
  onSort: (key: SortKey) => void;
  onSelect: (id: number) => void;
}

function sortClients(clients: Client[], key: SortKey, dir: "asc" | "desc"): Client[] {
  const sorted = [...clients].sort((a, b) => {
    if (key === "lifetimeValue") return a.lifetimeValue - b.lifetimeValue;
    return String(a[key]).localeCompare(String(b[key]));
  });
  return dir === "asc" ? sorted : sorted.reverse();
}

export function ClientTable({ clients, sortKey, sortDir, selectedId, onSort, onSelect }: ClientTableProps) {
  const rows = sortClients(clients, sortKey, sortDir);

  const header = (key: SortKey, label: string) => (
    <th>
      <button type="button" onClick={() => onSort(key)}>
        {label}
        {sortKey === key ? (sortDir === "asc" ? " \u2191" : " \u2193") : ""}
      </button>
    </th>
  );

  if (rows.length === 0) {
    return <div className="empty">No clients match this search.</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          {header("lastName", "Client")}
          {header("city", "City")}
          <th>Status</th>
          {header("createdAt", "Client since")}
          <th>Last booking</th>
          {header("lifetimeValue", "Lifetime value")}
        </tr>
      </thead>
      <tbody>
        {rows.map((client) => (
          <tr
            key={client.id}
            className={client.id === selectedId ? "clickable selected" : "clickable"}
            onClick={() => onSelect(client.id)}
          >
            <td>
              {client.firstName} {client.lastName}
              <div className="muted">{client.email}</div>
            </td>
            <td>{client.city}</td>
            <td>
              <span className={`badge ${client.status}`}>{client.status}</span>
            </td>
            <td>{formatDate(client.createdAt)}</td>
            <td>{client.destination ? `${client.destination}, ${client.nights} nights` : "None yet"}</td>
            <td>{money(client.lifetimeValue)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
