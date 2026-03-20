# Code Review Checklist

Core goals of a code review

- ✅ Catch bugs & edge cases
- ✅ Improve readability & maintainability
- ✅ Enforce architecture & standards
- ✅ Share knowledge across the team
- ❌ Not to nitpick personal style (automate that)

How to do a great review

- Switch to split view: Top-right → Diff settings → Split
- Ignore whitespace noise by adding this to the PR URL: ?w=1 (Removes indentation-only changes → huge clarity boost.)
- Gamify. Where could this break? Try and break it.
- Extensions:
  - VS Code Source Control → GitHub Pull Request extension. Browse PRs inside VS Code. Built-in side-by-side diff.
  - Error Lens
- Commits should be small logical steps, so people should be able to review commit by commit.

Context

- [ ] Read the ticket to understand what the aim is, and what problem is being solved?
- [ ] What are the acceptance criteria?
- [ ] identify upfront risk
- [ ] Get a sense of what's changed by reading the File tree
- [ ] List out the most interesting and most important files to review (Focus on: business logic, database code, concurrency, auth / validation)
  - [ ] Prompt AI to group changes into logical chunks so I can review and commit each one.

Pre-Review

- [ ] I ran and tested the code locally
- [ ] I reviewed my own diff

Review flow

- [ ] if it's a large new feature, then start from where the program would start. i.e the API entry point, and follow the flow of the logic through to the end (usually to the database layer).
- [ ] map out what's happening, add logs, think of all possible edge cases. (i.e the what if's?)
- [ ] Could add a unit test that starts where the code starts, and trace through to the end (mocking functions that weren't changed by the diff)

Correctness & Functionality

- [ ] Does the code do what the ticket says?
- [ ] Are edge cases handled?
- [ ] Are error paths implemented and tested?
- [ ] Are race conditions or concurrency issues possible?
- [ ] Proper locking strategy (optimistic/pessimistic) if needed?
- [ ] Are feature flags / config used correctly?
- [ ] Edge cases explicitly handled: Retries, Timeouts, Duplicate delivery

Readability & Maintainability

- [ ] Is the code easy to understand?
- [ ] Is the logic broken into small, composable functions?
- [ ] Is there good separation of concerns?
- [ ] Are functions sizes reasonable?

Architecture & Design

- [ ] Is business logic placed in the correct layer? (i.e. in services)
- [ ] Is the code easy to test?
- [ ] Minimal code duplication?
- [ ] Will this scale?

Performance

- [ ] Any there any unnecessary or nested loops?
- [ ] Are expensive operations cached or memoized where appropriate?
- [ ] Have you thought about latency vs memory trade-offs?

Security

- [ ] Are inputs validated and sanitized?
- [ ] Any risk of: SQL injection, XSS, CSRF, Command injection, etc.
- [ ] Are secrets excluded from source code and logs?
- [ ] Is sensitive data logged?
- [ ] Are auth checks correctly applied?

Testing

- [ ] Are unit tests included for every file / function and meaningful?
- [ ] Do tests cover: Happy path, Edge cases Error handling? (i.e both unit tests and integration tests)
- [ ] Are tests deterministic and fast?
- [ ] Is mocking used appropriately (not excessively)?

API & Contracts

- [ ] Are interfaces/types well defined?
- [ ] Are request/response formats validated?

Data & Database Changes

- [ ] Are migrations: Backward compatible, Reversible, Safe for large datasets?
- [ ] Are indexes added where needed?
- [ ] Any risk of table locks or long-running queries?

Logging & Observability

- [ ] Are logs structured and easy to parse?
- [ ] Are logs at appropriate levels (info, warn, error)?
- [ ] Are metrics collected and exposed?
- [ ] Are errors easy to understand and action from logs?

Configuration & Environment

- [ ] Any hard-coded varaibles that should be changed to environment variables?
- [ ] Are defaults safe?

Documentation

- [ ] Is the README / relevant docs updated?
- [ ] Are complex decisions explained?
- [ ] Are functions code documented?

General Heuristics

- [ ] Would I be happy to own this code in 6 months?
- [ ] Is this the simplest possible solution?
