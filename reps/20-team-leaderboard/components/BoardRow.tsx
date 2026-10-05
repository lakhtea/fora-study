import { memo, useRef } from "react";
import type { RankedRow } from "../types";
import { money } from "../../../shared/format";
import { useBoard } from "./BoardContext";

export const BoardRow = memo(function BoardRow({ row }: { row: RankedRow }) {
  const renders = useRef(0);
  renders.current += 1;
  const { period } = useBoard();
  const arrow = row.movement > 0 ? `\u2191${row.movement}` : row.movement < 0 ? `\u2193${Math.abs(row.movement)}` : "\u2013";
  return (
    <tr data-testid={`row-${row.advisorId}`} data-renders={renders.current}>
      <td>#{row.position}</td>
      <td>{row.name}</td>
      <td>{row.bookings}</td>
      <td>{money(row.revenue)}</td>
      <td aria-label={`Movement ${row.advisorId}`}>
        {arrow} <span className="muted">vs last {period}</span>
      </td>
    </tr>
  );
});
