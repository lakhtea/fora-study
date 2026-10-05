import { dedupe, firstOfMerge, intersection, mergeSorted, sortByCityThenPrice } from "./problem";

describe("01 arrays warmup", () => {
  it("merges without mutating", () => {
    const a = [1, 4, 9];
    const b = [2, 3, 10, 11];
    expect(mergeSorted(a, b)).toEqual([1, 2, 3, 4, 9, 10, 11]);
    expect(a).toEqual([1, 4, 9]);
    expect(mergeSorted([], [1])).toEqual([1]);
    expect(mergeSorted([1, 1], [1])).toEqual([1, 1, 1]);
  });
  it("sorts by city then price, locale aware, without mutating", () => {
    const rows = [
      { city: "paris", name: "Le Pigalle", price: 190 },
      { city: "Lisbon", name: "Memmo", price: 240 },
      { city: "Paris", name: "Lutetia", price: 640 },
      { city: "Lisbon", name: "Bairro Alto", price: 390 },
      { city: "lisbon", name: "Lumiares", price: 210 },
    ];
    const copy = [...rows];
    expect(sortByCityThenPrice(rows).map((r) => r.name)).toEqual(["Lumiares", "Memmo", "Bairro Alto", "Le Pigalle", "Lutetia"]);
    expect(rows).toEqual(copy);
  });
  it("dedupes keeping first order", () => {
    expect(dedupe([3, 1, 3, 2, 1])).toEqual([3, 1, 2]);
  });
  it("intersects in the first list's order", () => {
    expect(intersection([5, 1, 9, 2], [2, 9, 7])).toEqual([9, 2]);
  });
  it("finds the first of the merge in O(1)", () => {
    expect(firstOfMerge([4, 5], [2, 9])).toBe(2);
    expect(firstOfMerge([], [])).toBeUndefined();
    expect(firstOfMerge([1], [])).toBe(1);
  });
});
