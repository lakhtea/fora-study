export interface DayCell {
  date: string;
  available: boolean;
  rate: number;
}

export interface MonthAvailability {
  month: string;
  hotel: string;
  cells: DayCell[];
}
