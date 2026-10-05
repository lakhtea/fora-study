# Solution notes: arrays warmup

```ts
export function mergeSorted(a: readonly number[], b: readonly number[]): number[] {
  const out: number[] = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) out.push(a[i] <= b[j] ? a[i++] : b[j++]);
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}
```
Say: "Two pointers, one pass, one new array of length n + m. The inputs aren't touched. In place would mean shifting elements in a, which is O(n times m) unless a has spare capacity at the end, like the LeetCode variant."

```ts
export function sortByCityThenPrice(hotels: readonly HotelRow[]): HotelRow[] {
  return [...hotels].sort((x, y) => x.city.localeCompare(y.city, undefined, { sensitivity: "base" }) || x.price - y.price);
}
```
Say: "Copy first because sort mutates. `localeCompare` with base sensitivity treats Lisbon and lisbon as equal, then the `||` falls through to price. Default sort without a comparator is lexicographic, so `[10, 9, 1].sort()` gives `[1, 10, 9]`."

```ts
export function dedupe(ids: readonly number[]): number[] { return [...new Set(ids)]; }
export function intersection(a: readonly number[], b: readonly number[]): number[] {
  const inB = new Set(b);
  return a.filter((id) => inB.has(id));
}
export function firstOfMerge(a: readonly number[], b: readonly number[]): number | undefined {
  if (a.length === 0) return b[0];
  if (b.length === 0) return a[0];
  return Math.min(a[0], b[0]);
}
```
Say: "Set gives O(1) membership; the filter keeps a's order. The first of a merge is the smaller head, no merge needed."
