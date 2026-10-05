export type NotificationType = "price_drop" | "booking" | "message" | "payout";
export type NotificationStatus = "unread" | "read";
export type StatusFilter = NotificationStatus | "all";

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  status: NotificationStatus;
  createdAt: string;
  savings: number | null;
}
