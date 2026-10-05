import type { Client, Spotlight } from "../types";
import { formatDate, money } from "../../../shared/format";

export function SpotlightCard({ client, spotlight }: { client: Client; spotlight: Spotlight }) {
  const card = { ...client, ...spotlight };
  return (
    <div className="panel" aria-label="Spotlight">
      <h2>Client spotlight</h2>
      <p>
        <strong aria-label="Spotlight name">{card.name}</strong>, {card.city}
      </p>
      <p className="muted">
        {card.phone} <br /> {card.email}
      </p>
      <p aria-label="Spotlight trip">
        {spotlight.name}: departs {formatDate(card.departs)}, {money(card.total)}, {card.status}
      </p>
    </div>
  );
}
