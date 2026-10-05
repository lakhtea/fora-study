# Solution notes: ranked window

The state you were missing in the interview: one cursor per ranker (a `Map<RankerType, number>`) plus one `Set<number>` of taken ids. Each slot advances its ranker's cursor past any taken pro.

```ts
function takeNext(rankers: Rankers, cursors: Map<RankerType, number>, taken: Set<number>, type: RankerType): Pro | null {
  const list = rankers.get(type) ?? [];
  let i = cursors.get(type) ?? 0;
  while (i < list.length && taken.has(list[i].id)) i++;
  if (i >= list.length) { cursors.set(type, i); return null; }
  const pro = list[i];
  taken.add(pro.id);
  cursors.set(type, i + 1);
  return pro;
}

export function fillWindow(rankers: Rankers, window: readonly RankerType[]): (Pro | null)[] {
  const cursors = new Map<RankerType, number>();
  const taken = new Set<number>();
  return window.map((type) => takeNext(rankers, cursors, taken, type));
}

export class RankedFeed {
  private cursors = new Map<RankerType, number>();
  private taken = new Set<number>();
  constructor(private rankers: Rankers) {}
  next(window: readonly RankerType[]): (Pro | null)[] {
    return window.map((type) => takeNext(this.rankers, this.cursors, this.taken, type));
  }
}
```
Say: "Each ranker is an ordered list; the cursor is how far into that list we've consumed; the taken set makes dedupe O(1). The feed is the same function with the state lifted into an instance. Map iteration isn't needed here, only `get`, `set`, `has`."
