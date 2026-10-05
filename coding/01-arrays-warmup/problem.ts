// Fora's screens have asked small array questions like these. Narrate memory as you go.

export interface HotelRow {
  city: string;
  name: string;
  price: number;
}

// 1. Merge two sorted arrays of numbers into one sorted array. O(n + m) time, one new array, inputs untouched.
export function mergeSorted(a: readonly number[], b: readonly number[]): number[] {
  throw new Error("not implemented");
}

// 2. Sort hotels by city A to Z (locale aware), then by price low to high. Do not mutate the input.
export function sortByCityThenPrice(hotels: readonly HotelRow[]): HotelRow[] {
  throw new Error("not implemented");
}

// 3. Remove duplicate ids, keeping first occurrence order.
export function dedupe(ids: readonly number[]): number[] {
  throw new Error("not implemented");
}

// 4. Ids present in both lists, in the order of the first list. O(n + m).
export function intersection(a: readonly number[], b: readonly number[]): number[] {
  throw new Error("not implemented");
}

// 5. The first element of the merged result without building the whole merge. O(1).
export function firstOfMerge(a: readonly number[], b: readonly number[]): number | undefined {
  throw new Error("not implemented");
}
