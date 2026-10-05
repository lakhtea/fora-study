import type { Itinerary, Supplier, SupplierCategory } from "../types";
import { json, wait } from "../../../shared/format";

const SUPPLIERS: Supplier[] = [
  {
    id: 201,
    name: "Belmond Hotel Cipriani",
    category: "hotel",
    city: "Venice",
    price: 1180,
  },
  {
    id: 202,
    name: "Beaumont Mayfair",
    category: "hotel",
    city: "London",
    price: 690,
  },
  {
    id: 203,
    name: "Bear Creek Lodge",
    category: "hotel",
    city: "Jackson",
    price: 410,
  },
  {
    id: 204,
    name: "Berkeley Hotel",
    category: "hotel",
    city: "London",
    price: 720,
  },
  {
    id: 205,
    name: "Four Seasons Lisbon",
    category: "hotel",
    city: "Lisbon",
    price: 560,
  },
  {
    id: 206,
    name: "Hotel Arts Barcelona",
    category: "hotel",
    city: "Barcelona",
    price: 480,
  },
  {
    id: 207,
    name: "Rosewood Mayakoba",
    category: "hotel",
    city: "Playa del Carmen",
    price: 830,
  },
  {
    id: 208,
    name: "Aman Tokyo",
    category: "hotel",
    city: "Tokyo",
    price: 1450,
  },
  {
    id: 209,
    name: "Hotel Lutetia",
    category: "hotel",
    city: "Paris",
    price: 640,
  },
  {
    id: 210,
    name: "Bairro Alto Hotel",
    category: "hotel",
    city: "Lisbon",
    price: 390,
  },
  {
    id: 301,
    name: "Beach Club Day Pass",
    category: "activity",
    city: "Barcelona",
    price: 120,
  },
  {
    id: 302,
    name: "Beacon Hill Walking Tour",
    category: "activity",
    city: "Boston",
    price: 60,
  },
  {
    id: 303,
    name: "Alfama Food Walk",
    category: "activity",
    city: "Lisbon",
    price: 95,
  },
  {
    id: 304,
    name: "Doge's Palace Secret Itineraries",
    category: "activity",
    city: "Venice",
    price: 85,
  },
  {
    id: 305,
    name: "Tsukiji Sushi Class",
    category: "activity",
    city: "Tokyo",
    price: 140,
  },
  {
    id: 306,
    name: "Louvre After Hours",
    category: "activity",
    city: "Paris",
    price: 210,
  },
  {
    id: 401,
    name: "Bella Vista Transfers",
    category: "transfer",
    city: "Lisbon",
    price: 75,
  },
  {
    id: 402,
    name: "Blacklane Chauffeur",
    category: "transfer",
    city: "London",
    price: 110,
  },
  {
    id: 403,
    name: "Water Taxi Venice",
    category: "transfer",
    city: "Venice",
    price: 130,
  },
];

const ITINERARY: Itinerary = {
  id: 7,
  title: "Lisbon long weekend",
  clientName: "Maya Okafor",
  days: ["2026-11-03", "2026-11-04", "2026-11-05"],
  items: [
    {
      id: 1,
      dayIndex: 0,
      supplierId: 401,
      title: "Airport transfer",
      price: 75,
      note: "Flight lands 7:40am",
    },
    {
      id: 2,
      dayIndex: 0,
      supplierId: 205,
      title: "Four Seasons Lisbon",
      price: 560,
      note: "Requested high floor",
    },
    {
      id: 3,
      dayIndex: 1,
      supplierId: 303,
      title: "Alfama Food Walk",
      price: 95,
      note: "",
    },
    {
      id: 4,
      dayIndex: 2,
      supplierId: 210,
      title: "Bairro Alto Hotel",
      price: 390,
      note: "Late checkout confirmed",
    },
  ],
};

export async function apiFetch(url: string): Promise<Response> {
  const { pathname, searchParams } = new URL(url, "http://advisor.local");

  if (pathname === "/api/itineraries/7") {
    await wait(150, 300);
    return json(ITINERARY);
  }

  if (pathname === "/api/suppliers") {
    const category = searchParams.get("category") as SupplierCategory | null;
    const rows = category
      ? SUPPLIERS.filter((s) => s.category === category)
      : SUPPLIERS;
    await wait(120 + rows.length * 200);
    return json(rows);
  }

  return json({ message: "Not found" }, 404);
}
