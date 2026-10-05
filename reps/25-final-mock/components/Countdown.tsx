import { useEffect, useState } from "react";

export function Countdown({ initialSeconds, label }: { initialSeconds: number; label: string }) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    const handle = setInterval(() => {
      setSecondsLeft(Math.max(0, secondsLeft - 1));
    }, 1000);
    return () => clearInterval(handle);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  return (
    <div className="panel">
      <h2>Next call</h2>
      <div className="total counter" aria-label="Countdown">
        {minutes}:{seconds}
      </div>
      <div className="muted">{label}</div>
    </div>
  );
}
