export type CommissionStatus = "paid" | "pending" | "void";

export interface Commission {
  id: number;
  reference: string;
  client: string;
  supplier: string;
  travelDate: string;
  status: CommissionStatus;
  amount: number;
}

export type StatusFilter = CommissionStatus | "all";

export interface Filters {
  status: StatusFilter;
  from: string;
  to: string;
}

export interface ExportJob {
  id: number;
  rows: number;
}
