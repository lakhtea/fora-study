import { useState } from "react";

interface ShareHeaderProps {
  title: string;
  clientName: string;
  token: string;
}

export function ShareHeader({ title, clientName, token }: ShareHeaderProps) {
  const [copied, setCopied] = useState(false);

  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <div className="muted">Prepared for {clientName}</div>
      </div>
      <div className="row" style={{ alignItems: "center", gap: 10 }}>
        <button type="button" className="secondary" onClick={() => setCopied(true)} aria-label="Copy link">
          {copied ? "Link copied" : "Copy link"}
        </button>
        <span className="muted">share/{token}</span>
      </div>
    </header>
  );
}
