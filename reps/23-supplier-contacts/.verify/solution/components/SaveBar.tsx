import { events, trackClick } from "./analytics";

interface SaveBarProps {
  dirty: boolean;
  saving: boolean;
  savedAt: string | null;
  onSave: () => void;
}

export function SaveBar({ dirty, saving, savedAt, onSave }: SaveBarProps) {
  return (
    <div className="panel row" style={{ alignItems: "center", justifyContent: "space-between" }}>
      <span className="muted" aria-label="Save state">
        {saving ? "Saving" : dirty ? "Unsaved changes" : savedAt ? `Saved at ${savedAt}` : "Up to date"}
      </span>
      <span className="muted counter" aria-label="Events tracked">
        Events: {events.length}
      </span>
      <button type="button" className="primary" disabled={saving || !dirty} onClick={() => {
          trackClick("contacts_saved");
          onSave();
        }} aria-label="Save contacts">
        Save contacts
      </button>
    </div>
  );
}
