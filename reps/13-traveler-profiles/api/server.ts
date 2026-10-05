import type { Household } from "../types";
import { json, wait } from "../../../shared/format";

const HOUSEHOLD: Household = {
  clientName: "Maya Okafor",
  tripEnd: "2026-11-10",
  travelers: [
    { id: 901, name: "Maya Okafor", relationship: "Client", passportExpiry: "2029-03-14", passportCountry: "US", notes: "Aisle seat. Vegetarian meals." },
    { id: 902, name: "Tunde Okafor", relationship: "Spouse", passportExpiry: "2027-06-15", passportCountry: "US", notes: "" },
    { id: 903, name: "Ada Okafor", relationship: "Daughter", passportExpiry: "2027-05-01", passportCountry: "US", notes: "Minor; needs consent letter when traveling with one parent." },
    { id: 904, name: "Sofia Reyes", relationship: "Friend", passportExpiry: "2027-05-10", passportCountry: "MX", notes: "" },
    { id: 905, name: "Yuki Tanaka", relationship: "Friend", passportExpiry: "2027-02-01", passportCountry: "JP", notes: "Prefers window seat." },
    { id: 906, name: "Noah Reyes", relationship: "Friend's son", passportExpiry: null, passportCountry: null, notes: "Passport application in progress." },
  ],
};

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const { pathname } = new URL(url, "http://advisor.local");
  if (pathname === "/api/households/101") {
    await wait(120, 240);
    return json(HOUSEHOLD);
  }
  const match = pathname.match(/^\/api\/travelers\/(\d+)\/notes$/);
  if (match && init?.method === "PUT") {
    await wait(80, 160);
    const body = JSON.parse(String(init.body)) as { notes: string };
    const traveler = HOUSEHOLD.travelers.find((t) => t.id === Number(match[1]));
    if (!traveler) return json({ message: "Not found" }, 404);
    traveler.notes = body.notes;
    return json(traveler);
  }
  return json({ message: "Not found" }, 404);
}
