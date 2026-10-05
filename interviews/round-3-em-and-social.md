# Round 3: engineering manager (60 minutes) and social call (30 minutes), on Zoom

The EM decides two things: can this person own a project end to end inside a pod, and at which level. Fora's "How we work" page is the rubric (see `fora-facts.md`). Every story below uses only your verified material. Numbers marked "soften" need a qualifier or get left out.

## Story bank (STAR skeletons, 90 seconds each when spoken)

1. Four-agent on-call tool (lead story). On-call engineers spent hours per issue on triage and fixes. Built AI tooling on the Grafana, Loki, OpenTelemetry stack: four single-responsibility agents (summarize, generate the fix, review, open the PR) that confirmed all tests and CI passed before a mandatory human review gate. Most issues arrived largely or fully resolved; about an hour saved per issue. Trade-off to name: speed versus trust; the human gate was chosen on purpose. Maps to: AI in how we work, craft, impact.
2. AI-assisted dev environment. Developing across a shared library, a frontend, and several backends meant slow, error-prone setup. Built a multi-repo spin-up tool, then MCP connectors for Jira and Figma inside Cursor, plus rules, design-system conventions, and branch and PR scaffolding. About 30 minutes saved per workflow. Maps to: autonomy, engineering initiatives, AI fluency.
3. Shared platform for nine teams. One shared React, TypeScript, MUI component library consumed by nine separate brand-app repos, built and maintained by a three-person platform team; wrote standards, ran office hours. Supported nine product teams; about 10,000 new users within three months of a launch. Maps to: ownership, craft, cross-pod thinking.
4. Cypress to Vitest migration. CI was slow and flaky; migrated about 1,000 unit tests and about 20 end-to-end tests. Result (soften): roughly three-quarters off pipeline time and a real annual cost saving, "though I'd want to re-check the exact figures." Maps to: focus on impact, craft.
5. Ember to React and TypeScript migration. Defined conventions, led training, wrote docs, ran office hours, set timelines. Org-wide adoption. Maps to: timelines, no territories, leading without a title.
6. Mentoring a direct report (early 2025 to July 2026 while an IC). Coaching through reviews, docs, pairing. Say one concrete thing they became able to do on their own. Maps to: stronger together, senior scope.
7. A/B testing infrastructure. Built the experimentation infrastructure; drove $700K+ in additional revenue. Maps to: impact, the Membership and Growth pod.
8. Real-time trading blotters at Bank of America. React and AG Grid with complex state and sub-second responsiveness; WCAG modernization across 10+ apps. Maps to: data-heavy UI, performance, accessibility.

## Questions an EM at Fora will likely ask

Something you owned end to end and what you'd do differently. A disagreement with a PM or designer. What you cut when the project is bigger than the timeline. A technical decision with a real trade-off (story 1). Keeping quality high while moving fast (standards, reviews, tests at every step). How you use AI tools and where they fail you. A production incident and what changed after. How you've helped other engineers get better. What Staff means to you (honest: you'd grow into cross-pod influence; you'd be a strong Senior today). Why you left LTV and what you've done since August (one sentence: left July 2026, searching full-time since August, building a production learning project and interview prep; no apology).

## Questions to ask the EM

How is the frontend shared across pods, and who owns the design system? What does an eng spec look like and how does cross-pod review work? How is AI integrated into CI/CD today; what works and what doesn't? The last post-mortem that changed how the team works. What a strong first 90 days looks like in your pod. How engineering initiatives get chosen and protected. Where the ladder draws the Senior and Staff line.

## The social call (30 minutes)

Likely a PM, designer, or peer engineer (the earlier backend loop had a culture chat with a PM); ask the recruiter who. Scored on one question: would people here want to work with you every day.

- A two-minute version of you: App Academy, LTV platform team supporting nine product teams, the two AI tools, the direct report, why Fora. Record it until it ends cleanly.
- How you work with PMs and designers: always built alongside a designer; suggested requirement changes when the ticket didn't match the user problem; ran office hours so others could ship. Fora's "no territories or bad ideas" is the value you're matching.
- What you're like on a team: mentoring, the in-office preference (peers, mentors, mentees), disagreement handled by saying the concern once with a reason, then committing.
- Outside work: one or two true things; running and the marathon plan work.
- Questions for them: how product, design, and engineering split decisions inside a pod; an example of an engineer changing a requirement for the better; how advisor feedback reaches the team; what surprised them after joining.
- Listen more than you talk.
