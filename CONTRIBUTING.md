# Contributing

This document captures non-obvious facts about the repository that are easy to get wrong, especially for automated tooling and coding agents.

## Setup

**Each package requires its own `npm install`.** The npm workspace at the root only installs `concurrently`. To set up the full project:

```bash
npm install                  # installs root devDependencies (concurrently)
npm install -w apps/client   # installs client dependencies
npm install -w apps/server   # installs server dependencies
```

Copy the environment file before running the server:

```bash
cp apps/server/.env.example apps/server/.env
# then fill in SERP_SEARCH_API_KEY
```

## Running the apps

```bash
npm run dev        # starts both server (port 3001) and client (port 3000) concurrently
npm run test       # runs server unit tests then client unit tests
npm run typecheck  # runs TypeScript checks for both packages
npm run build      # builds server then client
```

Or run each independently from their directory (`apps/client/` or `apps/server/`).

## Testing gotchas

### Playwright integration tests require a running server
Playwright auto-starts the Vite dev server (client) but does **not** start the Express server. Before running integration or E2E tests, start the server separately:

```bash
# Terminal 1
cd apps/server && npm run dev

# Terminal 2
cd apps/client && npm run test:integration
```

### Mock file typo — do not rename
`apps/client/tests/integration/mocks/apiResponses/getNewsPeieces.ts` contains a deliberate typo ("Peieces" instead of "Pieces"). This filename is referenced by import in the integration test files. Do not rename it without updating those imports.

## Architecture decisions

### Shared types
`NewsPiece` and `RelevantNewsPiece` are defined once in `apps/shared/dataModel.ts` and re-exported from both `apps/client/src/dataModel/dataModel.ts` and `apps/server/src/dataModel/dataModel.ts`. When modifying these interfaces, change only the shared file — the per-package dataModel files will pick up the change automatically.

### Placeholder pages
The routes `/messenger`, `/market`, and `/account` render a `<PlaceholderPage>` component and are intentionally not implemented. Do not build these out without a feature specification.

### OpenAI integration
`apps/server/src/integration/openAIService.ts` currently powers only the `/api/quiz` endpoint. Stance detection (comparing article content against a user's statement using `RelevantNewsPiece`) is planned but not yet wired into any route. See the TODO comment at the top of `openAIService.ts`.

## Code conventions

- **Server logging**: use the Pino logger from `src/logger.ts` — never `console.log` on the server.
- **SVG imports**: use the `?react` suffix — `import Foo from './foo.svg?react'`.
- **Icon imports**: import from `src/icons/index.ts` (barrel file) rather than individual icon files.
- **Request validation**: controllers read from `request.validated`, not raw `req.query`/`req.body`. Validation is handled by the `validateRequest` middleware using Zod schemas in `src/schemas/`.
- **API base URL**: the client hardcodes `http://localhost:3001` in `src/services/getNewsPieces.ts`. Update this if deploying to a non-local environment.
