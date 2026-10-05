import type { Contact } from "../types";

interface ContactRowProps {
  contact: Contact;
  phone: string;
  email: string;
  isPrimary: boolean;
  onSelected: (id: number) => void;
  onEdit: (id: number, field: "phone" | "email", value: string) => void;
}

export function ContactRow({ contact, phone, email, isPrimary, onSelected, onEdit }: ContactRowProps) {
  return (
    <div className="card" data-testid={`contact-${contact.id}`}>
      <div className="card-header">
        <h3>
          {contact.name} <span className="muted">{contact.role}</span>
        </h3>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }} className="muted">
          <input type="radio" name="primary" checked={isPrimary} onChange={() => onSelected(contact.id)} aria-label={`Primary ${contact.name}`} /> primary
        </label>
      </div>
      <div className="row">
        <label>
          Phone
          <input value={phone} onChange={(e) => onEdit(contact.id, "phone", e.target.value)} aria-label={`Phone ${contact.name}`} />
        </label>
        <label>
          Email
          <input value={email} onChange={(e) => onEdit(contact.id, "email", e.target.value)} aria-label={`Email ${contact.name}`} />
        </label>
      </div>
    </div>
  );
}
