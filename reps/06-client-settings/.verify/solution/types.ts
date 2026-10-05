export interface ClientSummary {
  id: number;
  name: string;
}

export interface Preferences {
  newsletter: boolean;
  whatsapp: boolean;
  priceAlerts: boolean;
}

export interface ClientSettings {
  id: number;
  name: string;
  phone: string;
  currency: "USD" | "EUR" | "GBP";
  preferences: Preferences;
  travelerIds: number[];
}

export interface Traveler {
  id: number;
  name: string;
  relationship: string;
}

export type TravelerDirectory = Partial<Record<number, Traveler>>;
