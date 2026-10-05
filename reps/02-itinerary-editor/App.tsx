import { useEffect, useState } from "react";
import { fetchItinerary } from "./api/client";
import { AddItemPanel } from "./components/AddItemPanel";
import { DayList } from "./components/DayList";
import { ItemPanel } from "./components/ItemPanel";
import type { Itinerary, ItineraryItem, Supplier } from "./types";
import { money } from "../../shared/format";

let nextItemId = 1000;

export default function App() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchItinerary(7).then((data) => {
      if (!cancelled) setItinerary(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!itinerary) {
    return <div className="page muted">Loading itinerary</div>;
  }

  const updateItems = (
    updater: (items: ItineraryItem[]) => ItineraryItem[],
  ) => {
    setItinerary((current) =>
      current ? { ...current, items: updater(current.items) } : current,
    );
  };

  const handleAdd = (supplier: Supplier, dayIndex: number) => {
    const item: ItineraryItem = {
      id: nextItemId++,
      dayIndex,
      supplierId: supplier.id,
      title: supplier.name,
      price: supplier.price,
      note: "",
    };
    updateItems((items) => [...items, item]);
  };

  const handleRemove = (id: number) => {
    updateItems((items) => items.filter((item) => item.id !== id));
    setSelectedItemId((current) => (current === id ? null : current));
  };

  const handleMove = (id: number, direction: -1 | 1) => {
    updateItems((items) => {
      const index = items.findIndex((item) => item.id === id);
      const item = items[index];
      const siblings = items.filter(
        (candidate) => candidate.dayIndex === item.dayIndex,
      );
      const position = siblings.findIndex((candidate) => candidate.id === id);
      const swapWith = siblings[position + direction];
      if (!swapWith) return items;
      const swapIndex = items.findIndex(
        (candidate) => candidate.id === swapWith.id,
      );
      const next = [...items];
      next[index] = swapWith;
      next[swapIndex] = item;
      return next;
    });
  };

  const handleNoteBlur = (id: number, note: string) => {
    updateItems((items) =>
      items.map((item) => (item.id === id ? { ...item, note } : item)),
    );
  };

  const total = itinerary.items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>{itinerary.title}</h1>
          <div className="muted">
            {itinerary.clientName}, {itinerary.days.length} days,{" "}
            {itinerary.items.length} items
          </div>
        </div>
        <div className="total" aria-label="Trip total">
          {money(total)}
        </div>
      </header>
      <div className="layout">
        <DayList
          days={itinerary.days}
          items={itinerary.items}
          selectedItemId={selectedItemId}
          onSelect={setSelectedItemId}
          onRemove={handleRemove}
          onMove={handleMove}
          onNoteBlur={handleNoteBlur}
        />
        <div className="stack">
          <ItemPanel
            items={itinerary.items}
            days={itinerary.days}
            selectedItemId={selectedItemId}
          />
          <AddItemPanel dayCount={itinerary.days.length} onAdd={handleAdd} />
        </div>
      </div>
    </div>
  );
}
