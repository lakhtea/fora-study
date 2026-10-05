export type Period = "month" | "quarter";

export interface Advisor {
  id: number;
  name: string;
}

export interface RankedRow {
  advisorId: number;
  name: string;
  position: number;
  bookings: number;
  revenue: number;
  movement: number;
}

export type RankById = Record<number, RankedRow>;
