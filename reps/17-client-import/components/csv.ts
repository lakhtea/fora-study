import type { ImportRow } from "../types";

const DEFAULTS: Pick<ImportRow, "status" | "source"> = { status: "prospect", source: "csv" };

export function parseCsv(text: string): ImportRow[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const [header, ...body] = lines;
  const columns = header.split(",").map((c) => c.trim().toLowerCase());
  return body.map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const record = Object.fromEntries(columns.map((column, i) => [column, cells[i] ?? ""])) as Partial<ImportRow>;
    return { ...record, ...DEFAULTS } as ImportRow;
  });
}
