export type TripStatus = "upcoming" | "in-progress" | "completed";

export interface Trip {
  id: number;
  clientName: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  total: number;
  hotel: string;
}
