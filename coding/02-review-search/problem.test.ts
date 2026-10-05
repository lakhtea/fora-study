import { STAGE, buildIndex, searchAll, searchPhrase, searchWord, tokenize, type Review } from "./problem";

const REVIEWS: Review[] = [
  { id: 1, text: "Great plumber, showed up on time and didn't overcharge." },
  { id: 2, text: "Showed up late. The plumber was fine, the price was not." },
  { id: 3, text: "On time, great price, great work. Would hire again." },
  { id: 4, text: "He didn't show up at all." },
];

describe("02 review search", () => {
  it("stage 1: tokenizes and indexes", () => {
    expect(tokenize("Didn't overcharge, ON time!")).toEqual(["didnt", "overcharge", "on", "time"]);
    const index = buildIndex(REVIEWS);
    expect(searchWord(index, "plumber")).toEqual([1, 2]);
    expect(searchWord(index, "great")).toEqual([1, 3]);
    expect(searchWord(index, "Didn't")).toEqual([1, 4]);
    expect(searchWord(index, "zebra")).toEqual([]);
    expect(index.get("great")?.get(3)).toEqual([2, 4]);
  });
  it.skipIf(STAGE < 2)("stage 2: AND search", () => {
    const index = buildIndex(REVIEWS);
    expect(searchAll(index, ["showed", "up"])).toEqual([1, 2]);
    expect(searchAll(index, ["great", "time"])).toEqual([1, 3]);
    expect(searchAll(index, ["great", "zebra"])).toEqual([]);
    expect(searchAll(index, [])).toEqual([]);
  });
  it.skipIf(STAGE < 3)("stage 3: phrase search", () => {
    const index = buildIndex(REVIEWS);
    expect(searchPhrase(index, "showed up")).toEqual([1, 2]);
    expect(searchPhrase(index, "on time")).toEqual([1, 3]);
    expect(searchPhrase(index, "time great")).toEqual([3]);
    expect(searchPhrase(index, "great plumber showed")).toEqual([1]);
    expect(searchPhrase(index, "up on")).toEqual([1]);
    expect(searchPhrase(index, "plumber great")).toEqual([]);
  });
});
