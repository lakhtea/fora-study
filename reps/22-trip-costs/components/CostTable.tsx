import type { CostLine } from "../types";

interface CostTableProps {
  lines: CostLine[];
  converted: { id: number; usd: number }[];
}

const eur = new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" });
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function CostTable({ lines, converted }: CostTableProps) {
  const usdFor = (id: number) => converted.find((c) => c.id === id)?.usd ?? 0;
  return (
    <table aria-label="Cost lines">
      <thead>
        <tr>
          <th>Category</th>
          <th>Item</th>
          <th>Supplier (EUR)</th>
          <th>Client (USD)</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((line) => (
          <tr key={line.id}>
            <td>{line.category}</td>
            <td>{line.label}</td>
            <td aria-label={`EUR ${line.id}`}>{eur.format(line.amount)}</td>
            <td aria-label={`USD ${line.id}`}>{usd.format(usdFor(line.id))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
