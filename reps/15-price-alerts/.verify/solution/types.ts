export interface Booking {
  reference: string;
  hotel: string;
  client: string;
  checkIn: string;
  paidNightly: number;
}

export interface PriceAlert {
  id: number;
  reference: string;
  hotel: string;
  client: string;
  paidNightly: number;
  currentNightly: number;
  lastChecked: string;
  checks: number;
  status: "active" | "paused";
}
