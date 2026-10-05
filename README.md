# Fora study repo

Everything for the Fora Travel Senior/Staff Frontend Engineer loop in one place. `TRACKER.md` is the master checklist: when every box is ticked, you're done. Commit after each session.

## Setup

```
npm install
npm run typecheck     # everything type-checks, including the buggy reps (that's on purpose)
```

Node 18 or newer. Tests run under jsdom with `TZ=America/New_York` (date bugs depend on it): `TZ=America/New_York npm run verify 1`.

## Layout

| Folder | What's in it | Commands |
| --- | --- | --- |
| `reps/` | Debugging reps for round 1. Each is one advisor-portal page with exactly three planted bugs (React, TypeScript, logic), PM-voiced tickets in `BUGS.md`, a full answer key in `KEY.md`, and hidden tests in `.verify/`. Reps 01 to 12 are built and verified; 13 to 25 are designed in `generator/REP-CARDS.md` and generated with `generator/GENERATE-REP.md`. | `npm run rep N` (dev server), `npm run verify N` (prove the bugs reproduce on pristine code), `npm run check N` (acceptance tests for your fixes), `npm run solution N` (prove the key's fixes), `npm run reset N` (git restore) |
| `apps/` | Five small apps to build from a spec in 60 minutes, each a different skill: async lists, state architecture with autosave, forms, performance with windowing, async job workflows. Mock backend provided; you write the UI and client. | `npm run app N`, `npm run accept N` |
| `coding/` | Five typed, machine-checked problems: Fora-style array warm-ups, the Thumbtack review-search arc (staged), the ranked-window Map-and-cursor problem, debounce plus latest-only, Map aggregation. Solutions in `SOLUTION.md`. | `npm run coding N` |
| `api-design/` | The 60-minute script, conventions, probes, a rubric, eight Fora-flavored prompts, two model answers. | run with Claude as interviewer |
| `interviews/` | Round-by-round prep: protocol and budgets, DevTools tour and concepts, the story bank, social call, leadership answers, coffee chat, logistics, the thirty-minute review sheet, Fora facts. | read, record, rehearse |
| `generator/` | The repo-aware generator prompt, the upgrade prompt, and the 19 rep cards. | Claude Code |
| `shared/` | Styles and formatting helpers used by reps and apps. Don't edit while fixing a rep. | |

## How a debugging rep works

1. `npm run rep 3`. Open `reps/03-booking-form/BUGS.md` in a second window. Start a 30-minute timer. Narrate as if screen-sharing. Open the preview in a new tab and use React DevTools.
2. When the timer ends, `TZ=America/New_York npm run check 3`. Green means all three are fixed correctly; red names what isn't.
3. Open `KEY.md`. Read the "Looks right but isn't" sections even for bugs you fixed. Log any class you missed in `TRACKER.md` under "Classes to re-drill".
4. `npm run reset 3` restores the buggy version if you want to run it again.

To match the real environment, paste a rep's `types.ts`, `api/`, `components/`, and `App.tsx` into a React TypeScript pad in the CoderPad sandbox and run it there.

## How a build app works

`npm run app 2`, read `SPEC.md`, start a 60-minute timer, build `App.tsx` plus whatever components and `api/client.ts` you want, verify each behavior in the browser as you go. `npm run accept 2` runs the acceptance tests; the spec names the labels they look for. The naive version of app 04 is also the lab for the profiling drills in `interviews/round-2-react-intensive.md`.

## Generating reps 07 to 25

In Claude Code at the repo root, paste `generator/GENERATE-REP.md` with `REP` set to the next number. It writes the rep in this layout and must pass typecheck, `verify`, and `solution` before it hands over. Grade it with the two-minute checklist in `TRACKER.md` before you start the timer.
