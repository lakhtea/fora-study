export type SupplierCategory = "hotel" | "activity" | "transfer";

export interface Supplier {
  id: number;
  name: string;
  category: SupplierCategory;
  city: string;
  price: number;
}

export interface ItineraryItem {
  id: number;
  dayIndex: number;
  supplierId: number;
  title: string;
  price: number;
  note: string;
}

export interface Itinerary {
  id: number;
  title: string;
  clientName: string;
  days: string[];
  items: ItineraryItem[];
}
