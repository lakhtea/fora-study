import { useState } from "react";
import { BoardRow } from "./BoardRow";
import { useBoard } from "./BoardContext";

export function Board() {
  const { rows } = useBoard();
  const [bottomFirst, setBottomFirst] = useState(false);
  const ordered = bottomFirst ? rows.reverse() : rows;
  return (
    <div className="panel">
      <div className="card-header">
        <h2>Leaderboard</h2>
        <label className="muted" style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" checked={bottomFirst} onChange={(e) => setBottomFirst(e.target.checked)} aria-label="Bottom first" /> bottom first
        </label>
      </div>
      <table aria-label="Board">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Advisor</th>
            <th>Bookings</th>
            <th>Revenue</th>
            <th>Movement</th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((row) => (
            <BoardRow key={row.advisorId} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
