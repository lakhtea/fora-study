export type PayoutStatus = "paid" | "pending" | "held";

export interface Payout {
  id: number;
  month: string;
  amount: number;
  status: PayoutStatus;
  reviewed: boolean;
  bookings: number;
}

export interface PayoutSettings {
  threshold: number;
  defaultThreshold: number;
  schedule: "weekly" | "monthly";
}
