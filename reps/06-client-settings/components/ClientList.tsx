import type { ClientSummary } from "../types";

interface ClientListProps {
  clients: ClientSummary[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function ClientList({ clients, selectedId, onSelect }: ClientListProps) {
  return (
    <div className="panel">
      <h2>Clients</h2>
      <ul className="list" aria-label="Client list">
        {clients.map((client) => (
          <li key={client.id}>
            <button type="button" className="link" onClick={() => onSelect(client.id)} aria-current={client.id === selectedId ? "true" : undefined}>
              {client.id === selectedId ? "\u25CF " : "\u25CB "}
              {client.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
