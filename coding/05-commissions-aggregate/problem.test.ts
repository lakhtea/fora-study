import { paidByMonth, topAdvisors, totalsByAdvisor, type Booking } from "./problem";

const B: Booking[] = [
  { id: 1, advisor: "Zoe", month: "2026-09", status: "paid", commission: 300 },
  { id: 2, advisor: "amir", month: "2026-09", status: "paid", commission: 500 },
  { id: 3, advisor: "Zoe", month: "2026-10", status: "pending", commission: 200 },
  { id: 4, advisor: "Zoe", month: "2026-10", status: "void", commission: 999 },
  { id: 5, advisor: "Bea", month: "2026-11", status: "paid", commission: 500 },
  { id: 6, advisor: "amir", month: "2026-11", status: "pending", commission: 50 },
];

describe("05 commissions aggregate", () => {
  it("totals per advisor with void excluded from amounts", () => {
    expect(totalsByAdvisor(B)).toEqual([
      { advisor: "amir", paid: 500, pending: 50, count: 2 },
      { advisor: "Bea", paid: 500, pending: 0, count: 1 },
      { advisor: "Zoe", paid: 300, pending: 200, count: 3 },
    ]);
  });
  it("top N in a month with name tiebreak", () => {
    expect(topAdvisors(B, "2026-09", 1)).toEqual(["amir"]);
    expect(topAdvisors(B, "2026-09", 5)).toEqual(["amir", "Zoe"]);
    expect(topAdvisors(B, "2026-10", 3)).toEqual([]);
  });
  it("fills missing months with zeros", () => {
    const m = paidByMonth(B);
    expect([...m.entries()]).toEqual([
      ["2026-09", 800],
      ["2026-10", 0],
      ["2026-11", 500],
    ]);
  });
});
