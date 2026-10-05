import { useState } from "react";

export function Composer({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [text, setText] = useState("");
  return (
    <form
      className="row"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text.trim());
        setText("");
      }}
    >
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message" aria-label="Message text" disabled={disabled} style={{ flex: 1, padding: 8 }} />
      <button type="submit" className="primary" disabled={disabled || !text.trim()}>
        Send
      </button>
    </form>
  );
}
