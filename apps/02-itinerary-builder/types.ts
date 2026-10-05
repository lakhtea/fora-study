export type ItemKind = "hotel" | "activity" | "transfer" | "note";

export interface ItineraryItem {
  id: string;
  dayIndex: number;
  kind: ItemKind;
  title: string;
  price: number;
}

export interface Itinerary {
  id: number;
  title: string;
  days: string[];
  items: ItineraryItem[];
  version: number;
}
