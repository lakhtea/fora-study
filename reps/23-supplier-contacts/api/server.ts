import type { SupplierContacts } from "../types";
import { json, wait } from "../../../shared/format";

let DATA: SupplierContacts = {
  supplier: "Bairro Alto Hotel",
  primaryId: 11,
  contacts: [
    { id: 11, name: "Ines Carvalho", role: "Reservations manager", phone: "+351 21 340 8288", email: "ines@bairroaltohotel.example" },
    { id: 12, name: "Rui Santos", role: "Front desk lead", phone: "+351 21 340 8290", email: "rui@bairroaltohotel.example" },
    { id: 13, name: "Marta Silva", role: "Groups and events", phone: "+351 21 340 8295", email: "marta@bairroaltohotel.example" },
  ],
};

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const { pathname } = new URL(url, "http://advisor.local");
  if (pathname === "/api/suppliers/501/contacts") {
    if (init?.method === "PUT") {
      await wait(150, 300);
      DATA = JSON.parse(String(init.body)) as SupplierContacts;
      return json(DATA);
    }
    await wait(100, 200);
    return json(DATA);
  }
  return json({ message: "Not found" }, 404);
}

export function resetServer() {
  DATA = {
    ...DATA,
    primaryId: 11,
    contacts: [
      { id: 11, name: "Ines Carvalho", role: "Reservations manager", phone: "+351 21 340 8288", email: "ines@bairroaltohotel.example" },
      { id: 12, name: "Rui Santos", role: "Front desk lead", phone: "+351 21 340 8290", email: "rui@bairroaltohotel.example" },
      { id: 13, name: "Marta Silva", role: "Groups and events", phone: "+351 21 340 8295", email: "marta@bairroaltohotel.example" },
    ],
  };
}
