export interface Hotel {
  id: number;
  name: string;
  city: string;
  stars: number;
  rate: number;
  neighborhood: string;
}

interface Amenity {
  code: string;
  label: string;
}

export interface HotelDetail extends Hotel {
  description: string;
  amenities: Amenity[];
  checkIn: string;
}

export interface SearchFilters {
  query: string;
  city: string;
  minStars: number;
}
