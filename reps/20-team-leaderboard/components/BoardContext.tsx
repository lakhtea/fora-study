import { createContext, useContext } from "react";
import type { Period, RankById, RankedRow } from "../types";

export interface BoardValue {
  period: Period;
  rows: RankedRow[];
  rankById: RankById;
  secondsSinceUpdate: number;
}

export const BoardContext = createContext<BoardValue | null>(null);

export function useBoard(): BoardValue {
  const value = useContext(BoardContext);
  if (!value) throw new Error("useBoard must be used inside BoardContext");
  return value;
}
