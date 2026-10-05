export interface Traveler {
  id: number;
  name: string;
  relationship: string;
  passportExpiry: string | null;
  passportCountry: string | null;
  notes: string;
}

export interface Household {
  clientName: string;
  tripEnd: string;
  travelers: Traveler[];
}

export type ExpiryById = Record<number, string>;
