import { json, wait } from "../../../shared/format";

interface HotelRecord {
  id: number;
  name: string;
  city: string;
  stars: number;
  rate: string;
  neighborhood: string;
  description: string;
  amenities: { code: string; label: string }[];
  checkIn: string;
}

const HOTELS: HotelRecord[] = [
  { id: 11, name: "Bairro Alto Hotel", city: "Lisbon", stars: 5, rate: "390.00", neighborhood: "Chiado", description: "Boutique hotel above the rooftops of Chiado.", amenities: [{ code: "rooftop", label: "Rooftop bar" }, { code: "spa", label: "Spa" }], checkIn: "15:00" },
  { id: 12, name: "Four Seasons Ritz", city: "Lisbon", stars: 5, rate: "560.00", neighborhood: "Marques de Pombal", description: "Grand hotel with the city's best gym.", amenities: [{ code: "pool", label: "Pool" }, { code: "gym", label: "Gym" }, { code: "spa", label: "Spa" }], checkIn: "15:00" },
  { id: 13, name: "Memmo Alfama", city: "Lisbon", stars: 4, rate: "240.00", neighborhood: "Alfama", description: "Design hotel with a red rooftop pool.", amenities: [{ code: "pool", label: "Pool" }, { code: "rooftop", label: "Rooftop bar" }], checkIn: "14:00" },
  { id: 14, name: "The Lumiares", city: "Lisbon", stars: 4, rate: "210.00", neighborhood: "Bairro Alto", description: "Apartment-style suites with kitchens.", amenities: [{ code: "kitchen", label: "Kitchens" }, { code: "rooftop", label: "Rooftop bar" }], checkIn: "15:00" },
  { id: 15, name: "Hotel das Amoreiras", city: "Lisbon", stars: 3, rate: "150.00", neighborhood: "Amoreiras", description: "Quiet three-star near the aqueduct.", amenities: [{ code: "breakfast", label: "Breakfast included" }], checkIn: "14:00" },
  { id: 21, name: "Hotel Lutetia", city: "Paris", stars: 5, rate: "640.00", neighborhood: "Saint-Germain", description: "Art deco landmark on the Left Bank.", amenities: [{ code: "spa", label: "Spa" }, { code: "pool", label: "Pool" }], checkIn: "15:00" },
  { id: 22, name: "Hotel des Grands Boulevards", city: "Paris", stars: 4, rate: "280.00", neighborhood: "2nd arrondissement", description: "Courtyard restaurant and a rooftop terrace.", amenities: [{ code: "rooftop", label: "Rooftop bar" }, { code: "restaurant", label: "Restaurant" }], checkIn: "15:00" },
  { id: 23, name: "Le Pigalle", city: "Paris", stars: 3, rate: "190.00", neighborhood: "Pigalle", description: "Neighborhood hotel with a record collection.", amenities: [{ code: "bar", label: "Bar" }], checkIn: "15:00" },
  { id: 24, name: "Hotel Providence", city: "Paris", stars: 4, rate: "310.00", neighborhood: "10th arrondissement", description: "Velvet and cocktails in the rooms.", amenities: [{ code: "bar", label: "Bar" }, { code: "restaurant", label: "Restaurant" }], checkIn: "15:00" },
  { id: 31, name: "Aman Tokyo", city: "Tokyo", stars: 5, rate: "1450.00", neighborhood: "Otemachi", description: "Thirty-third floor lobby with a view of the palace gardens.", amenities: [{ code: "spa", label: "Spa" }, { code: "pool", label: "Pool" }, { code: "gym", label: "Gym" }], checkIn: "15:00" },
  { id: 32, name: "Trunk Hotel", city: "Tokyo", stars: 4, rate: "330.00", neighborhood: "Shibuya", description: "Socializing hotel a block from Cat Street.", amenities: [{ code: "bar", label: "Bar" }, { code: "restaurant", label: "Restaurant" }], checkIn: "15:00" },
  { id: 33, name: "Hotel Gracery Shinjuku", city: "Tokyo", stars: 3, rate: "160.00", neighborhood: "Shinjuku", description: "The one with Godzilla on the roof.", amenities: [{ code: "breakfast", label: "Breakfast included" }], checkIn: "14:00" },
  { id: 34, name: "Park Hyatt Tokyo", city: "Tokyo", stars: 5, rate: "890.00", neighborhood: "Shinjuku", description: "The New York Bar is still the New York Bar.", amenities: [{ code: "pool", label: "Pool" }, { code: "bar", label: "Bar" }, { code: "spa", label: "Spa" }], checkIn: "15:00" },
  { id: 35, name: "Hoshinoya Tokyo", city: "Tokyo", stars: 5, rate: "1120.00", neighborhood: "Otemachi", description: "A ryokan in a tower.", amenities: [{ code: "onsen", label: "Onsen" }, { code: "spa", label: "Spa" }], checkIn: "15:00" },
];

export async function apiFetch(url: string): Promise<Response> {
  const { pathname, searchParams } = new URL(url, "http://advisor.local");

  if (pathname === "/api/hotels") {
    await wait(150, 400);
    const q = (searchParams.get("q") ?? "").trim().toLowerCase();
    const city = searchParams.get("city") ?? "";
    const minStars = Number(searchParams.get("minStars") ?? 0);
    const rows = HOTELS.filter(
      (h) => (!city || h.city === city) && h.stars >= minStars && (!q || `${h.name} ${h.neighborhood}`.toLowerCase().includes(q))
    ).map(({ description, amenities, checkIn, ...summary }) => summary);
    return json({ results: rows, total: rows.length });
  }

  const detailMatch = pathname.match(/^\/api\/hotels\/(\d+)$/);
  if (detailMatch) {
    await wait(150, 300);
    const hotel = HOTELS.find((h) => h.id === Number(detailMatch[1]));
    if (!hotel) return json({ message: "Not found" }, 404);
    return json(hotel);
  }

  return json({ message: "Not found" }, 404);
}
