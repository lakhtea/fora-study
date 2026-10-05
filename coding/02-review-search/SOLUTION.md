# Solution notes: review search

```ts
export function tokenize(text: string): string[] {
  return (text.toLowerCase().replaceAll("'", "").match(/[a-z0-9]+/g) ?? []);
}
```
Say "replaceAll, not replace, because replace with a string hits the first occurrence only." That was your logged bug class.

```ts
export function buildIndex(reviews: readonly Review[]): Index {
  const index: Index = new Map();
  for (const review of reviews) {
    tokenize(review.text).forEach((word, position) => {
      let postings = index.get(word);
      if (!postings) index.set(word, (postings = new Map()));
      let positions = postings.get(review.id);
      if (!positions) postings.set(review.id, (positions = []));
      positions.push(position);
    });
  }
  return index;
}
export function searchWord(index: Index, word: string): number[] {
  const [token] = tokenize(word);
  return [...(index.get(token)?.keys() ?? [])].sort((a, b) => a - b);
}
```
Map iteration: `for (const [id, positions] of postings)`, `.keys()`, `.has()`, `.get()`.

```ts
export function searchAll(index: Index, words: readonly string[]): number[] {
  const tokens = words.flatMap(tokenize);
  if (tokens.length === 0) return [];
  const postingLists = tokens.map((t) => index.get(t) ?? new Map<number, number[]>());
  postingLists.sort((a, b) => a.size - b.size);
  const [rarest, ...rest] = postingLists;
  return [...rarest.keys()].filter((id) => rest.every((p) => p.has(id))).sort((a, b) => a - b);
}
```
Say: "Start from the rarest word so the candidate set is smallest; every other check is a Map `has`."

```ts
export function searchPhrase(index: Index, phrase: string): number[] {
  const tokens = tokenize(phrase);
  if (tokens.length === 0) return [];
  const lists = tokens.map((t) => index.get(t));
  if (lists.some((l) => !l)) return [];
  const [first, ...rest] = lists as Map<number, number[]>[];
  const hits: number[] = [];
  for (const [id, positions] of first) {
    const consecutive = positions.some((p) => rest.every((list, k) => list.get(id)?.includes(p + k + 1)));
    if (consecutive) hits.push(id);
  }
  return hits.sort((a, b) => a - b);
}
```
Say: "The requirement change is why positions are stored: a phrase is a word at p, the next at p + 1, and so on. Without positions you'd re-scan text for every candidate."
