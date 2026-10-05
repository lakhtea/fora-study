// The Thumbtack arc: start with a word search over reviews, then a requirement change forces a better structure.
// Stage 1: tokenize, build an inverted index, search one word.
// Stage 2: AND search for several words (all must appear in the review).
// Stage 3: phrase search (the words appear consecutively), which needs positions.
// Bump STAGE as you pass each one.

export const STAGE: 1 | 2 | 3 = 1;

export interface Review {
  id: number;
  text: string;
}

// Lowercase, strip apostrophes, split on anything that isn't a letter or digit. "Didn't" -> "didnt".
export function tokenize(text: string): string[] {
  throw new Error("not implemented");
}

// word -> Map<reviewId, positions[]>. Positions are token indexes within that review.
export type Index = Map<string, Map<number, number[]>>;

export function buildIndex(reviews: readonly Review[]): Index {
  throw new Error("not implemented");
}

// Review ids containing the word, ascending.
export function searchWord(index: Index, word: string): number[] {
  throw new Error("not implemented");
}

// Stage 2: review ids containing every word, ascending. Start from the rarest word.
export function searchAll(index: Index, words: readonly string[]): number[] {
  throw new Error("not implemented");
}

// Stage 3: review ids where the words appear consecutively in order, ascending.
export function searchPhrase(index: Index, phrase: string): number[] {
  throw new Error("not implemented");
}
