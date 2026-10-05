export interface Contact {
  id: number;
  name: string;
  role: string;
  phone: string;
  email: string;
}

export interface SupplierContacts {
  supplier: string;
  primaryId: number;
  contacts: Contact[];
}

export type ContactEdits = Record<number, Partial<Pick<Contact, "phone" | "email">>>;
