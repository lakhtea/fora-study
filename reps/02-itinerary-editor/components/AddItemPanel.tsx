import { useEffect, useState } from "react";
import { fetchSuppliers } from "../api/client";
import type { Supplier, SupplierCategory } from "../types";
import { money } from "../../../shared/format";

interface AddItemPanelProps {
  dayCount: number;
  onAdd: (supplier: Supplier, dayIndex: number) => void;
}

export function AddItemPanel({ dayCount, onAdd }: AddItemPanelProps) {
  const [category, setCategory] = useState<SupplierCategory>("activity");
  const [dayIndex, setDayIndex] = useState(0);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSuppliers(category).then((rows) => {
      if (!cancelled) {
        setSuppliers(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [category]);

  return (
    <div className="panel">
      <h2>Add to itinerary</h2>
      <div className="toolbar">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as SupplierCategory)}
          aria-label="Supplier category"
        >
          <option value="hotel">Hotels</option>
          <option value="activity">Activities</option>
          <option value="transfer">Transfers</option>
        </select>
        <select
          value={dayIndex}
          onChange={(e) => setDayIndex(Number(e.target.value))}
          aria-label="Target day"
        >
          {Array.from({ length: dayCount }, (_, i) => (
            <option key={i} value={i}>
              Day {i + 1}
            </option>
          ))}
        </select>
      </div>
      {loading && <div className="muted">Loading suppliers</div>}
      <ul className="list" aria-label="Supplier results">
        {suppliers.map((supplier) => (
          <li key={supplier.id}>
            <span>
              {supplier.name} <span className="muted">{supplier.city}</span>
            </span>
            <span>
              {money(supplier.price)}{" "}
              <button
                type="button"
                className="link"
                onClick={() => onAdd(supplier, dayIndex)}
              >
                Add
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
