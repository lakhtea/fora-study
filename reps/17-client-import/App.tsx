import { useEffect, useState } from "react";
import { fetchExistingClients, importClients } from "./api/client";
import { parseCsv } from "./components/csv";
import { PreviewTable } from "./components/PreviewTable";
import type { ClientStatus, ExistingClient, ImportRow } from "./types";

const SAMPLE = `name,email,city,status
Priya Natarajan,priya.n@example.com,Chicago,active
Maya Okafor,maya.okafor@example.com,Brooklyn,active
Sam Adeyemi,sam.adeyemi@example.com,Atlanta,
Sam Adeyemi,sam.adeyemi@example.com,Atlanta,prospect
Elena Marchetti,elena.m@example.com,Miami,inactive`;

export default function App() {
  const [text, setText] = useState(SAMPLE);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [existing, setExisting] = useState<ExistingClient[] | undefined>();
  const [statusEdits, setStatusEdits] = useState<Record<string, ClientStatus>>({});
  const [result, setResult] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchExistingClients().then((clients) => {
      if (!cancelled) setExisting(clients);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const existingEmails = new Set((existing ?? []).map((c) => c.email.toLowerCase()));
  const newRows = rows.filter((row) => !existingEmails.has(row.email.toLowerCase()));

  const handleParse = () => {
    setRows(parseCsv(text));
    setStatusEdits({});
    setResult(null);
  };

  const handleImport = async () => {
    setImporting(true);
    const count = await importClients(newRows.map((row) => ({ ...row, status: statusEdits[row.email] ?? row.status })));
    setResult(`Imported ${count} clients.`);
    setImporting(false);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Import clients</h1>
          <div className="muted" aria-label="Existing count">
            {existing === undefined ? "Loading your clients" : `Checking against ${existing.length} existing clients`}
          </div>
        </div>
      </header>
      <div className="layout">
        <div className="panel form">
          <label>
            Paste CSV (name, email, city, status)
            <textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} aria-label="CSV" />
          </label>
          <div className="row">
            <button type="button" className="secondary" onClick={handleParse}>
              Parse
            </button>
            <button type="button" className="primary" onClick={handleImport} disabled={importing || newRows.length === 0}>
              {importing ? "Importing" : `Import ${newRows.length} new`}
            </button>
          </div>
          {result && (
            <div className="notice" role="status">
              {result}
            </div>
          )}
        </div>
        {rows.length > 0 ? <PreviewTable rows={rows} existingEmails={existingEmails} statusEdits={statusEdits} onStatusChange={(email, status) => setStatusEdits((current) => ({ ...current, [email]: status }))} /> : <div className="panel empty">Parse a CSV to preview it.</div>}
      </div>
    </div>
  );
}
