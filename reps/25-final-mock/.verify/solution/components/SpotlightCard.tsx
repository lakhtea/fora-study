import type { Client, Spotlight } from "../types";
import { formatDate, money } from "../../../shared/format";

export function SpotlightCard({ client, spotlight }: { client: Client; spotlight: Spotlight }) {
  return (
    <div className="panel" aria-label="Spotlight">
      <h2>Client spotlight</h2>
      <p>
        <strong aria-label="Spotlight name">{client.name}</strong>, {client.city}
      </p>
      <p className="muted">
        {client.phone} <br /> {client.email}
      </p>
      <p aria-label="Spotlight trip">
        {spotlight.name}: departs {formatDate(spotlight.departs)}, {money(spotlight.total)}, {spotlight.status}
      </p>
    </div>
  );
}
