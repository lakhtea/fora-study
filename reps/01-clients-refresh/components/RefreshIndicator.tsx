import { useEffect, useState } from "react";

interface RefreshIndicatorProps {
  refreshedAt: number | null;
}

export function RefreshIndicator({ refreshedAt }: RefreshIndicatorProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (refreshedAt === null) return;
    const handle = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(handle);
  }, [refreshedAt]);

  if (refreshedAt === null) {
    return <span className="muted">Loading clients</span>;
  }

  const seconds = Math.floor((now - refreshedAt) / 1000);

  return (
    <span className="muted">
      Last refreshed {seconds > 0 ? seconds : 0}s ago
    </span>
  );
}
