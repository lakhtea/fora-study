export type RefundStatus = "pending" | "approved" | "denied";
export type Decision = "approved" | "denied";

export interface RefundRequest {
  id: number;
  client: string;
  booking: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  requestedAt: string;
  ownerAdvisorId: number;
  note: string;
}
