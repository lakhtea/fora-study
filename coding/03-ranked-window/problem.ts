// The Thumbtack round-1 problem you didn't finish. A Map of rankers, each an ordered list of pros
// (not every pro appears in every ranker). A "window" is a list of ranker types, one per slot, like
// ["base", "new", "base", "quality"]. Fill the slots in order: slot k takes the next pro from that
// ranker that hasn't been used yet. Each ranker keeps its own cursor. Skip pros already taken.
// If a ranker runs out, leave that slot empty and continue.
//
// Stage 1: fillWindow for one window.
// Stage 2: a RankedFeed that keeps cursors between calls, so "next page" continues where the last left off.

export const STAGE: 1 | 2 = 1;

export type RankerType = "base" | "new" | "quality";
export interface Pro {
  id: number;
  name: string;
}
export type Rankers = Map<RankerType, Pro[]>;

export function fillWindow(rankers: Rankers, window: readonly RankerType[]): (Pro | null)[] {
  throw new Error("not implemented");
}

export class RankedFeed {
  constructor(rankers: Rankers) {
    throw new Error("not implemented");
  }
  // Returns the next window's worth of pros, continuing from the previous call, with no duplicates ever.
  next(window: readonly RankerType[]): (Pro | null)[] {
    throw new Error("not implemented");
  }
}
