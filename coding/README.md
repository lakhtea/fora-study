# Coding problems

Short, typed, machine-checked. Each folder has `problem.ts` (you write the bodies), `problem.test.ts` (the checker), and `SOLUTION.md` (open after you pass or after 25 minutes; every solution has been run against the tests at the top stage). Run `npm run coding 2`.

Problems 1 and 5 are Fora-shaped (small array and Map work with memory said out loud). Problems 2, 3, and 4 are the Thumbtack problems you said you should have drilled: the review-search arc that grows into an inverted index, the ranked-window Map-and-cursor problem from the round you didn't finish, and debounce plus latest-only as pure utilities so the mechanism is yours cold.

Rules you set for yourself: you type every line; hint levels only; say "first occurrence or all?" whenever you type `replace`; narrate memory ("this allocates one new array of n + m").

Problems with a `STAGE` constant are staged: pass stage 1, bump `STAGE`, and the next tests unlock.
