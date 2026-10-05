import type { ImportRow } from "../types";

const STATUSES = ["active", "prospect", "inactive"] as const;

function toStatus(value: string | undefined): ImportRow["status"] {
  const normalized = (value ?? "").trim().toLowerCase();
  return (STATUSES as readonly string[]).includes(normalized) ? (normalized as ImportRow["status"]) : "prospect";
}

export function parseCsv(text: string): ImportRow[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const [header, ...body] = lines;
  const columns = header.split(",").map((c) => c.trim().toLowerCase());
  return body.map((line, index) => {
    const cells = line.split(",").map((c) => c.trim());
    const record: Record<string, string> = Object.fromEntries(columns.map((column, i) => [column, cells[i] ?? ""]));
    return {
      rowId: index + 1,
      name: record.name ?? "",
      email: record.email ?? "",
      city: record.city ?? "",
      status: toStatus(record.status),
      source: "csv",
    };
  });
}
