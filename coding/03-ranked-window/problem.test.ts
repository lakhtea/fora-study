import { RankedFeed, STAGE, fillWindow, type Pro, type Rankers } from "./problem";

const p = (id: number): Pro => ({ id, name: `Pro ${id}` });
function rankers(): Rankers {
  return new Map([
    ["base", [p(1), p(2), p(3), p(4), p(5)]],
    ["new", [p(9), p(2), p(8)]],
    ["quality", [p(3), p(1), p(7)]],
  ]);
}

describe("03 ranked window", () => {
  it("stage 1: fills a window with no duplicates and per-ranker cursors", () => {
    expect(fillWindow(rankers(), ["base", "new", "base", "quality"]).map((x) => x?.id ?? null)).toEqual([1, 9, 2, 3]);
    expect(fillWindow(rankers(), ["new", "new", "new", "new"]).map((x) => x?.id ?? null)).toEqual([9, 2, 8, null]);
    expect(fillWindow(rankers(), ["quality", "base", "quality", "base"]).map((x) => x?.id ?? null)).toEqual([3, 1, 7, 2]);
  });
  it.skipIf(STAGE < 2)("stage 2: a feed continues across pages", () => {
    const feed = new RankedFeed(rankers());
    expect(feed.next(["base", "new"]).map((x) => x?.id ?? null)).toEqual([1, 9]);
    expect(feed.next(["base", "new"]).map((x) => x?.id ?? null)).toEqual([2, 8]);
    expect(feed.next(["quality", "quality", "quality"]).map((x) => x?.id ?? null)).toEqual([3, 7, null]);
    expect(feed.next(["base", "base", "base"]).map((x) => x?.id ?? null)).toEqual([4, 5, null]);
  });
});
