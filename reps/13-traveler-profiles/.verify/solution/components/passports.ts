export function monthsBetween(fromIso: string, toIso: string): number {
  const [y1, m1] = fromIso.split("-").map(Number);
  const [y2, m2] = toIso.split("-").map(Number);
  return (y2 - y1) * 12 + (m2 - m1);
}

export function sixMonthsAfter(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + 6, d));
  return date.toISOString().slice(0, 10);
}

export function needsRenewal(tripEnd: string, expiry: string): boolean {
  return expiry < sixMonthsAfter(tripEnd);
}

const DEMO_TODAY = Date.UTC(2026, 9, 5);

export function daysUntil(iso: string): number {
  return Math.round((Date.parse(iso) - DEMO_TODAY) / 86400000);
}
