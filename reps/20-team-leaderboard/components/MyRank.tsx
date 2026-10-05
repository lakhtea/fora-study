import type { Advisor } from "../types";
import { money } from "../../../shared/format";
import { useBoard } from "./BoardContext";

interface MyRankProps {
  advisors: Advisor[];
  viewAsId: number;
  onViewAs: (id: number) => void;
}

export function MyRank({ advisors, viewAsId, onViewAs }: MyRankProps) {
  const { rankById, rows, period } = useBoard();
  const mine = rankById[viewAsId];
  const leader = rows[0];
  const gap = leader.revenue - mine.revenue;
  return (
    <div className="panel">
      <h2>My rank</h2>
      <select value={viewAsId} onChange={(e) => onViewAs(Number(e.target.value))} aria-label="View as">
        {advisors.map((advisor) => (
          <option key={advisor.id} value={advisor.id}>
            {advisor.name}
          </option>
        ))}
      </select>
      <div className="total" aria-label="My position">
        #{mine.position} this {period}
      </div>
      <p className="muted">
        {mine.bookings} bookings, {money(mine.revenue)}. {gap === 0 ? "You lead the board." : `${money(gap)} behind ${leader.name}.`}
      </p>
    </div>
  );
}
