export type ClientStatus = "active" | "prospect" | "inactive";

export interface ClientSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  status: ClientStatus;
  createdAt: string;
  lastTripAt: string | null;
  lifetimeValue: number;
}

export interface LastBooking {
  bookingId: number;
  destination: string;
  nights: number;
  createdAt: string;
}

export interface ClientRow extends ClientSummary {
  lastBooking: LastBooking | null;
}

export interface Client extends ClientSummary {
  lastBookingDestination: string | null;
  lastBookingNights: number | null;
}

export interface ClientDetail extends ClientSummary {
  phone: string;
  preferences: string[];
  notes: string[];
}

export interface Trip {
  id: number;
  clientId: number;
  destination: string;
  startDate: string;
  endDate: string;
  total: number;
}

export type SortKey = "lastName" | "city" | "lifetimeValue" | "createdAt";

export interface ClientQuery {
  search: string;
  status: ClientStatus | "all";
}
