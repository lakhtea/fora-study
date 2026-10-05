import { debounce, latestOnly } from "./problem";

describe("04 debounce and latest-only", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("debounce fires once with the latest args after quiet", () => {
    const spy = vi.fn();
    const d = debounce(spy, 300);
    d("a");
    vi.advanceTimersByTime(100);
    d("ab");
    vi.advanceTimersByTime(100);
    d("abc");
    vi.advanceTimersByTime(299);
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("abc");
  });
  it("debounce cancel drops the pending call", () => {
    const spy = vi.fn();
    const d = debounce(spy, 300);
    d("a");
    d.cancel();
    vi.advanceTimersByTime(1000);
    expect(spy).not.toHaveBeenCalled();
  });
  it("latestOnly delivers only the newest result even when it resolves first", async () => {
    const results: string[] = [];
    const slowThenFast = latestOnly(async (q: string, delay: number) => {
      await new Promise((r) => setTimeout(r, delay));
      return q.toUpperCase();
    });
    const first = slowThenFast("par", 500).then((r) => { if (r !== undefined) results.push(r); });
    const second = slowThenFast("paris", 100).then((r) => { if (r !== undefined) results.push(r); });
    await vi.advanceTimersByTimeAsync(600);
    await Promise.all([first, second]);
    expect(results).toEqual(["PARIS"]);
  });
});
