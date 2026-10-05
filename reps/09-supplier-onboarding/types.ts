export type SupplierType = "hotel" | "activity" | "transfer";
export type DocumentKind = "license" | "insurance" | "w9" | "bank" | "vehicle";

export interface SupplierDocument {
  kind: DocumentKind;
  label: string;
  fileName: string;
  uploadedAt: string;
  received: boolean;
}

export interface OnboardingRecord {
  id: number;
  name: string;
  type: SupplierType;
  contact: string;
  documents: SupplierDocument[];
}

export type Requirements = Record<SupplierType, DocumentKind[]>;

export const KIND_LABELS: Record<DocumentKind, string> = {
  license: "Business license",
  insurance: "Liability insurance",
  w9: "W-9",
  bank: "Bank details",
  vehicle: "Vehicle registration",
};
