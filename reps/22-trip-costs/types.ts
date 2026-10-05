export type Category = "hotel" | "activities" | "transfers" | "fees";

export interface CostLine {
  id: number;
  category: Category;
  label: string;
  amount: number;
}

export interface TripCosts {
  tripId: number;
  title: string;
  supplierCurrency: "EUR";
  lines: CostLine[];
}
