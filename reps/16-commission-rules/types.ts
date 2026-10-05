export type Tier = "preferred" | "standard" | "boutique";
export type Quarter = "Q3" | "Q4";

export interface Rule {
  id: number;
  tier: Tier;
  label: string;
  rate: number;
  enabled: boolean;
}

export interface SampleBooking {
  id: number;
  supplier: string;
  tier: Tier;
  gross: number;
}

export interface SampleSet {
  quarter: Quarter;
  bookings: SampleBooking[];
}
