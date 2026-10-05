export interface ShareView {
  token: string;
  title: string;
  clientName: string;
  advisor: { name: string; email: string; phone: string };
  days: { index: number; date: string; label: string }[];
}

export interface DayItem {
  id: number;
  time: string;
  title: string;
  detail: string;
}
