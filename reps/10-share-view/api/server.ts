import type { DayItem, ShareView } from "../types";
import { json, wait } from "../../../shared/format";

const SHARES: Record<string, ShareView & { expired?: boolean }> = {
  "maya-2026": {
    token: "maya-2026",
    title: "Lisbon long weekend",
    clientName: "Maya Okafor",
    advisor: { name: "Lakhte", email: "lakhte@fora.example", phone: "+1 347 555 0100" },
    days: [
      { index: 0, date: "2026-11-03", label: "Arrival" },
      { index: 1, date: "2026-11-04", label: "Alfama" },
      { index: 2, date: "2026-11-05", label: "Departure" },
    ],
  },
  "expired-77": {
    token: "expired-77",
    title: "Paris in spring",
    clientName: "Chloe Dubois",
    advisor: { name: "Lakhte", email: "lakhte@fora.example", phone: "+1 347 555 0100" },
    days: [],
    expired: true,
  },
};

const ITEMS: Record<string, DayItem[][]> = {
  "maya-2026": [
    [
      { id: 1, time: "07:40", title: "Airport transfer", detail: "Driver meets you at arrivals with a sign." },
      { id: 2, time: "15:00", title: "Four Seasons Lisbon", detail: "Check-in; high floor requested." },
      { id: 3, time: "17:30", title: "Welcome drink", detail: "On the rooftop, weather permitting." },
      { id: 4, time: "19:30", title: "Dinner at Belcanto", detail: "Tasting menu, reserved under Okafor." },
      { id: 5, time: "22:00", title: "Fado at Clube de Fado", detail: "Optional; tickets held until 21:30." },
    ],
    [
      { id: 6, time: "10:00", title: "Alfama food walk", detail: "Meet at Largo das Portas do Sol." },
      { id: 7, time: "14:00", title: "Free afternoon", detail: "Tram 28 or the castle." },
      { id: 8, time: "20:00", title: "Dinner at Cervejaria Ramiro", detail: "No reservation; go early." },
    ],
    [{ id: 9, time: "11:00", title: "Checkout and transfer", detail: "Driver at 11:00 for a 14:10 flight." }],
  ],
};

export async function apiFetch(url: string): Promise<Response> {
  const { pathname } = new URL(url, "http://advisor.local");

  const shareMatch = pathname.match(/^\/api\/share\/([\w-]+)$/);
  if (shareMatch) {
    await wait(120, 220);
    const share = SHARES[shareMatch[1]];
    if (!share) return json({ message: "This link doesn't exist" }, 404);
    if (share.expired) return json({ message: "This link has expired. Ask your advisor for a new one." }, 410);
    const { expired, ...view } = share;
    return json(view);
  }

  const dayMatch = pathname.match(/^\/api\/share\/([\w-]+)\/days\/(\d+)$/);
  if (dayMatch) {
    const items = ITEMS[dayMatch[1]]?.[Number(dayMatch[2])] ?? [];
    await wait(100 + items.length * 120);
    return json(items);
  }

  return json({ message: "Not found" }, 404);
}
