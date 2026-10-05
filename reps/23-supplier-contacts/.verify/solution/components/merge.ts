import type { Contact, ContactEdits } from "../types";

export function mergeContact(contact: Contact, edits: ContactEdits): Contact {
  const edit = edits[contact.id];
  return {
    ...contact,
    phone: edit?.phone ?? contact.phone,
    email: edit?.email ?? contact.email,
  };
}
