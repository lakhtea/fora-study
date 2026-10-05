export type ClientStatus = "active" | "prospect" | "inactive";

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  status: ClientStatus;
  lifetimeValue: number;
  createdAt: string;
}

export interface ClientDetail extends Client {
  phone: string;
  notes: string[];
  upcomingTrips: { destination: string; startDate: string }[];
}
