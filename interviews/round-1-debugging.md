# Round 1: React debugging (45 minutes, CoderPad, 3 bugs)

Confirmed format: 5 minutes intros, 30 minutes debugging, 10 minutes Q&A. A React + TypeScript page similar to the advisor portal with exactly three bugs testing React, TypeScript, and debugging skills. Screen shared over Zoom. AI note-takers off. Compensation decided entirely by interview performance.

## The protocol (say each step aloud)

1. Restate. "Expected X, actual Y. Let me reproduce it first."
2. Read the console top to bottom; the first error is usually the real one; follow the stack to the first line in app code. If the console is silent and the page is wrong, suspect the types: `as`, `!`, `any`, `?.`, `res.json()` near the broken feature.
3. Localize. Which component owns the state that's wrong? React DevTools Components tab, inspect props and hooks, say what you see. Name the layer before reading code: rendering, state consistency, async ordering, data at the API boundary, plain logic.
4. Hypothesize, then prove with one log or breakpoint.
5. Fix the cause, not the symptom. Name the root cause before typing. Ask whether the same pattern exists elsewhere.
6. Verify on the page and say "verified." Name the regression test.

## The 30-minute budget

0 to 2 orient (read the file tree, root component, the Read.me for versions; open the preview in a new tab for DevTools; describe the page aloud: state, data, actions). 2 to 11 bug 1. 11 to 20 bug 2. 20 to 28 bug 3 and anything parked. 28 to 30 summary: "Fixed and verified 1, 2, 3; tests I'd add; on anything parked my hypothesis is X."

Three bugs, ten minutes each. Park at minute seven of a bug with a stated hypothesis and move on. Name each bug's flavor as you find it (React, TypeScript, logic).

## CoderPad

Multi-file pad with a VS Code style editor, file tree, rendered preview, a console mirroring the browser console, a Logs panel for the dev server, and a shell. It transpiles without type-checking, so a wrong type may produce no error at all; treat red squiggles as clues and the running page as the truth. Practice in the free sandbox (coderpad.io/sandbox): add a React TypeScript pad, open the preview in a new tab, confirm React DevTools works there, set key bindings. Share layout: pad left, preview tab with DevTools right. The session is recorded with playback.

## What to say

- Opening: "I'll take a minute to read the page first, then take the bugs in order and tell you when I move on."
- "Before I touch the code I want to see it fail."
- "My hypothesis is a stale closure; I'll confirm with one log rather than guess."
- "Root cause: X. Fix: Y. The same pattern is in Z, so I'll fix both."
- Moving on: "I've spent seven minutes here; I'll park it with my hypothesis and come back if there's time."
- Clarifying questions that earn points: "Is it the order, the count, or the contents that's wrong?" "Is the API response shape fixed?"

## The ten-minute Q&A

Ask two or three: What does the advisor portal's frontend architecture look like, and what would you most like to change? How do bugs like these get caught before production here? How is AI used in your day-to-day frontend work, and what's the review rule for what it writes? What does a typical week look like on your pod?

## Array warm-up (Fora screens have asked it)

Merge two sorted arrays with two pointers into a new array; sort without mutating (`[...arr].sort`, `toSorted`); comparator chaining with `localeCompare || price`; dedupe with Set; say memory out loud. See `coding/01-arrays-warmup`.
