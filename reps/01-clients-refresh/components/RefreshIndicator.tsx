import { useEffect, useState } from "react";

interface RefreshIndicatorProps {
  refreshedAt: number | null;
}

export function RefreshIndicator({ refreshedAt }: RefreshIndicatorProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setSeconds(0);
    const handle = setInterval(() => {
      setSeconds(seconds + 1);
    }, 1000);
    return () => clearInterval(handle);
  }, [refreshedAt]);

  if (refreshedAt === null) {
    return <span className="muted">Loading clients</span>;
  }
  return <span className="muted">Last refreshed {seconds}s ago</span>;
}
