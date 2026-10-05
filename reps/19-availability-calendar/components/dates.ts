export function toLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const date = toLocalDate(iso);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = toLocalDate(checkOut).getTime() - toLocalDate(checkIn).getTime();
  return Math.floor(ms / 86400000);
}
