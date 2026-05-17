# TODO

Single source of truth for project roadmap and outstanding work.

The "Feedback log" section at the bottom is appended to automatically by the in-app feedback widget (see `src/service/morningBrief/submitFeedback.ts`) — do not delete that heading.

## Morning Brief — Known Limitations & Future Work

- [ ] **Seen-content tracking**: Paul Graham essays and other non-daily sources can repeat across runs. A simple "seen list" (JSON file storing seen URLs) would prevent repetition.
- [ ] **Token-level streaming**: The SSE stream currently delivers each section as a complete payload. Per-token streaming (using Claude's streaming API) would make the UI feel more alive.
- [ ] **Personalisation UI**: The `personalContext.md` file is currently edited manually. A simple textarea on the Morning Brief page that saves to the server would be more convenient.

## Upcoming Features

- [ ] **Stance Detection**: Integrate ChatGPT API to summarize articles and detect agreement/disagreement between sources.
- [ ] **Infrastructure**: Deploy on AWS using CloudFormation/Terraform.
- [ ] **Architecture**: Integrate Next.js for better routing and SEO.
- [ ] **Containers**: Package backend with Docker for consistent environments.
- [ ] **Micro-frontends**: Explore `single-spa` for modular UI development.
- [ ] **UI/UX**: Implement AI-assisted form filling for the Sign-Up/Profile page.

## Maintenance

- [ ] Update HTML parsing selectors periodically as news site structures change.
- [ ] Improve state management as the application grows.
- [ ] Integrate TurboRepo for better monorepo management.
- [ ] Cover non-ideal and edge cases in `parseHtml` tests (see `apps/server/src/service/parseHtml/parseHtml.test.ts:179`).
- [ ] Decide on and implement a linting rule baseline.

## Backlog / Ideas

Promoted from earlier free-form notes — each rough idea tightened into a checklist item, links preserved.

- [ ] Pin down exactly what I want to know each morning (refine Morning Brief content rules).
- [ ] Build a memory-improvement feature into the app.
- [ ] Interview-prepper AI agent.
- [ ] In-app messaging.
- [ ] Continuity "catch-up" Claude session — "You last read X; since then Y, Z have happened." (Branch exists.)
- [ ] Personalised podcasts / project-specific content suggestions.
- [ ] Agent internet-search & summarise mode — prompt: "biggest headline news stories of the month, de-duplicated, ranked by civilisational impact, condensed bullets."
- [ ] Curate a list of ~20 seminal works (Principia, "Attention Is All You Need", Shannon '48, Watson & Crick, "A Computer Scientist's Guide to Cell Biology"). Reference chat: https://chatgpt.com/c/69ff606b-1c60-8325-93e6-ea30d061c75c
- [ ] Close the "Open Claw" info gap — figure out how to stay ahead of releases like that.
- [ ] Reference reading: blog on auto-research.
- [ ] Reference reading: AI-assisted bug triage with swipe-style UX (building AI-powered GitHub issue triage with the Copilot SDK).
- [ ] 30-min moonshot: pick a classically-hard, knowledge-heavy task doable through language (e.g. AI cyber CISO) and prototype.

## Feedback log

<!-- Appended automatically by submitFeedback.ts. New entries land below as `## <ISO timestamp>` sub-sections. -->
