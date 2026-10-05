import type { OnboardingRecord, Requirements } from "../types";
import { json, wait } from "../../../shared/format";

const RECORD: OnboardingRecord = {
  id: 501,
  name: "Bairro Alto Hotel",
  type: "hotel",
  contact: "ines@bairroaltohotel.example",
  documents: [
    { kind: "license", label: "Business license", fileName: "bah-license-2026.pdf", uploadedAt: "2026-09-12", received: true },
    { kind: "insurance", label: "Liability insurance", fileName: "bah-liability.pdf", uploadedAt: "2026-09-14", received: true },
    { kind: "w9", label: "W-9", fileName: "bah-w9.pdf", uploadedAt: "2026-09-20", received: false },
  ],
};

const REQUIREMENTS: Requirements = {
  hotel: ["license", "insurance", "w9", "bank"],
  activity: ["license", "insurance", "w9"],
  transfer: ["license", "insurance", "w9", "vehicle"],
};

export async function apiFetch(url: string): Promise<Response> {
  const { pathname } = new URL(url, "http://advisor.local");
  if (pathname === "/api/onboarding/501") {
    await wait(120, 240);
    return json(RECORD);
  }
  if (pathname === "/api/onboarding/requirements") {
    await wait(60, 120);
    return json(REQUIREMENTS);
  }
  return json({ message: "Not found" }, 404);
}
