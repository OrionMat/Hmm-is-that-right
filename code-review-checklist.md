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

- [ ] Start with context, not the code. Before reading the diff:
  - [ ] Read the ticket or plan to understand what the aim is, and what problem is being solved?
  - [ ] What are the acceptance criteria?
  - [ ] identify upfront risk
- [ ] Get a sense of what's changed by reading the File tree → which important files have changed?

Review Flow

- [ ] if it's a large new feature, then start from where the program would start. i.e the API entry point, and follow the flow of the logic (usually to the database layer).
- [ ] List out the most interesting and most important files to review
  - Review the most important file first, these are the key files that are needed for the feature to work. From entry to output.
  - Focus on: business logic, database code, concurrency, auth / validation
- [ ] Prompt AI or sub agents to group changes into logical chunks so I can review and commit each one.
- [ ] If it's a big and complex feature
  - [ ] pull the branch & run it
  - [ ] map out what's happening, add logs, think of all possible edge cases. (i.e the what if's?)
- [ ] map out what's happening, add logs, think of all possible edge cases. (i.e the what if's?)
- [ ] Could add a unit test that starts where the code starts, and trace through to the end (mocking functions that weren't changed by the diff)

Pre-Review

- [ ] I ran and tested the code locally
- [ ] I reviewed my own diff

Correctness & Functionality

- [ ] Does the code do what the ticket says?
- [ ] Are edge cases handled? Edge cases explicitly handled: Retries, Timeouts, Duplicate delivery, etc.
- [ ] Are error paths implemented and tested?
- [ ] Are race conditions or concurrency issues possible?
- [ ] Proper locking strategy (optimistic/pessimistic) if needed?
- [ ] Are feature flags / config used correctly?
- [ ] The deleted code is actually no longer necessary (i.e not losing important logs etc.)

Readability & Maintainability

- [ ] Is the code easy to understand? (i.e No simplifications can be made to new code)
- [ ] Is the logic broken into small, composable functions?
- [ ] Is there good separation of concerns?
- [ ] Are functions sizes reasonable?
- [ ] Repeated code is refactored
- [ ] Not too many inputs to functions, grouped into objects if necessary
- [ ] Sensible naming with minimal abbreviations

Architecture & Design

- [ ] Is business logic placed in the correct layer? (i.e. in services)
- [ ] Is the code easy to test?
- [ ] Minimal code duplication?
- [ ] Will this scale?
- [ ] Be consistent with existing code in repo where possible.

Performance

- [ ] Any there any unnecessary or nested loops?
- [ ] Are expensive operations cached or memoized where appropriate?
- [ ] Have you thought about latency vs memory trade-offs?
- [ ] Minimum number of calls to databases and 3rd party services

Security

- [ ] Are inputs validated and sanitized?
- [ ] Any risk of: SQL injection, XSS, CSRF, Command injection, etc.
- [ ] Are secrets excluded from source code and logs?
- [ ] Is sensitive data logged?
- [ ] Are auth checks correctly applied?

Testing

- [ ] Are unit tests included for every file / function and meaningful, but not excessive?
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

- [ ] Appropriate logging to help future debugging and error tracing.
- [ ] Are errors easy to understand and action from logs?
- [ ] Are logs structured and easy to parse?
- [ ] Are logs at appropriate levels (info, warn, error)?
- [ ] Are metrics collected and exposed?
- [ ] Inclusion of correlation IDs for traceability.

Configuration & Environment

- [ ] Any hard-coded variables that should be changed to environment variables?
- [ ] Are defaults safe?
- [ ] Are configuration values documented in readme
- [ ] Is an example env file provided

Documentation

- [ ] Is the README / relevant docs updated?
- [ ] Are complex decisions explained?
- [ ] Are functions code documented?

Housekeeping

- [ ] Release versions in the package.json.
- [ ] New configuration variables are added to the README.md or example.env.

General Heuristics

- [ ] Would I be happy to own this code in 6 months?
- [ ] Is this the simplest possible solution?
