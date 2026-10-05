export type ClientStatus = "active" | "prospect" | "inactive";

export interface ExistingClient {
  id: number;
  name: string;
  email: string;
}

export interface ImportRow {
  rowId: number;
  name: string;
  email: string;
  city: string;
  status: ClientStatus;
  source: string;
}
