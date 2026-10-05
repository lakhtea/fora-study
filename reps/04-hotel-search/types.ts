export interface Hotel {
  id: number;
  name: string;
  city: string;
  stars: number;
  rate: number;
  neighborhood: string;
}

export interface HotelDetail extends Hotel {
  description: string;
  amenities: string[];
  checkIn: string;
}

export interface SearchFilters {
  query: string;
  city: string;
  minStars: number;
}
