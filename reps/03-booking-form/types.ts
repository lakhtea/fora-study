export interface RoomType {
  code: string;
  name: string;
  maxGuests: number;
  price: number;
}

export interface Room {
  type: string;
  guests: number;
}

export interface Traveler {
  name: string;
  email: string;
}

export interface Quote {
  nights: number;
  nightlyTotal: number;
  taxes: number;
  total: number;
}

export interface Confirmation {
  reference: string;
  total: number;
}
