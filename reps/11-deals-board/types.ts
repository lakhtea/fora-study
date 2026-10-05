export type DealCategory = "hotel" | "cruise" | "activity";

export interface Deal {
  id: number;
  supplier: string;
  city: string;
  category: DealCategory;
  headline: string;
  discountPercent: number;
  validUntil: string;
  perks: string[];
}
