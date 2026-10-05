import type { Contact, ContactEdits } from "../types";

export function mergeContact(contact: Contact, edits: ContactEdits): Contact {
  return { ...edits[contact.id], ...contact };
}
