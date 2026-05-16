# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

```bash
# Install dependencies
cd apps/server && npm install
cd ../client && npm install

# Copy env template and fill in keys (see Environment Setup below)
cp apps/server/.env.example apps/server/.env

# Run dev servers (two terminals)
cd apps/server && npm run dev   # → http://localhost:3001
cd apps/client && npm run dev   # → http://localhost:3000

# Verify everything is working
cd apps/server && npm test
cd apps/client && npm run test:unit
```

## Project Overview

"Hmm is that right?" is a news web application centred on a Morning Brief: a daily LLM-summarised digest of world headlines, tech stories, and long-form pieces, plus a free-form news search that scopes SerpAPI queries to user-selected sources. It also offers a media literacy quiz (Academics).

## Repository Structure

This is a monorepo with apps under `apps/`:

```
Hmm-is-that-right/
├── apps/
│   ├── client/          # React SPA (Vite)
│   └── server/          # Express API (Node.js)
├── .github/workflows/   # CI/CD (ci.yml)
├── CLAUDE.md
├── README.md
└── code-review-checklist.md
```

Client and server are independent npm packages — each has its own `node_modules/` and must be installed/run separately.

## Architecture

### Client (`apps/client/`)
- **Framework**: React 19, React Router v6
- **Styling**: Tailwind CSS 4
- **Build**: Vite with TypeScript 5.9.3 (strict mode)
- **Testing**: Vitest (unit), Playwright (integration + E2E)
- **Key directories**:
  - `src/pages/` — Route-level pages (MorningBrief, Academics, Home, SignUp)
  - `src/components/` — Reusable UI (LoadingSpinner, PageContainer, SearchBar, Tile, etc.)
  - `src/navigation/` — AppRoutes.tsx (all routes), AppNavigation.tsx (wrapper)
  - `src/service/` — API client functions (`morningBriefStream.ts`)
  - `src/dataModel/` — Shared TypeScript interfaces (`dataModel.ts`, `quizModel.ts`)
  - `src/hooks/` — Custom React hooks (`useQuiz.ts`)
  - `src/icons/` — Icon components (SVG via vite-plugin-svgr)
  - `tests/integration/` — Playwright integration tests with mocked API responses
  - `tests/e2e/` — Playwright full E2E tests

### Server (`apps/server/`)
- **Framework**: Express 5, Pino logging
- **Build**: tsup → `dist/` (CommonJS, Node 22+)
- **Testing**: Vitest
- **Key directories**:
  - `src/routes/` — Express routers (one file per endpoint)
  - `src/controllers/` — Route handlers (extract params, call service, return JSON)
  - `src/service/` — Business logic (`morningBrief/`, `cleanUrls/`, `parseHtml/`)
  - `src/integration/` — External API wrappers (`googleSearch/`, `scrapePageHtml/`, `llmService/`, `fetchRssFeed/`, `hackerNews/`, `reddit/`, `paulGraham/`)
  - `src/schemas/` — Zod validation schemas for request inputs
  - `src/middleware/` — `validateRequest.ts`, `requestContext.ts`, `errorHandler.ts`
  - `src/config/` — `serverConfig.ts` (env vars), `sources.ts` (CSS selectors), `rssFeeds.ts`
  - `src/dataModel/` — Server-side TypeScript interfaces

### Client Routes

| Path | Component | Status |
|------|-----------|--------|
| `/` | redirects to `/home` | — |
| `/home` | Home | Landing page |
| `/morning-brief` | MorningBrief | Main feature — daily brief + free-form news search with source toggles |
| `/academics` | Academics | Quiz |
| `/sign-up` | SignUp | Registration |
| `/messenger`, `/market`, `/account` | Placeholder | Not implemented |

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/morning-brief/stream` | SSE stream of the Morning Brief sections |
| POST | `/api/quiz` | Generate quiz questions |

`/api/morning-brief/stream` query params:
- `date` (optional, `YYYY-MM-DD`) — override the date for mode rotation testing.
- `nocache=1` (optional) — bypass the in-memory section cache.
- `query` (optional, 1–200 chars) — when present, replaces the three default sections with a single SerpAPI-driven search section.
- `sources` (optional, repeatable, one of `bbc|nyt|ap`) — which toggle sources are enabled. Filters the World section in default mode and scopes the search section in search mode. Defaults to all.

### Server Request Pipeline

```
HTTP Request
  → validateRequest middleware (Zod schema)
  → controller (extract params, call service)
  → service (orchestrate business logic)
      ├── googleSearch() → SerpAPI
      ├── cleanUrls()    → filter/deduplicate
      ├── scrapePageHtml() → axios HTML fetch
      └── parseHtml()    → JSDOM + CSS selectors
  → JSON response
```

### Data Models (shared between client and server)

```typescript
NewsPiece {
  url: string;
  title: string | null | undefined;
  date: string | null | undefined;
  body: Array<string | null | undefined>;  // paragraphs
  source: string;
}

HeadlineSummary {
  source: string;
  url: string;
  title: string;
  date: string | null | undefined;
  summary: string[];  // LLM-generated bullet points
}
```

## Development Commands

### Server
**Working directory**: `apps/server/`

```bash
npm run dev        # tsx watch (hot-reload, port 3001)
npm run build      # tsup → dist/
npm run start      # node dist/index.js
npm run test       # Vitest (run once)
npm run typecheck  # tsc --noEmit

# Run a single test file (faster feedback)
npx vitest run src/service/cleanUrls/cleanUrls.test.ts
```

### Client
**Working directory**: `apps/client/`

```bash
npm run dev              # Vite dev server (port 3000, proxies /api → 3001)
npm run build            # tsc + vite build → build/
npm run preview          # serve production build
npm run test             # Vitest watch mode
npm run test:unit        # Vitest run once
npm run test:integration # Playwright integration tests
npm run test:e2e         # Playwright E2E tests
npm run lint             # ESLint (0 warnings allowed)
npm run type-check       # tsc --noEmit

# Run a single test file (faster feedback)
npx vitest run src/pages/MorningBrief/MorningBrief.test.tsx
npx playwright test tests/integration/morning-brief.spec.ts
```

## Environment Setup

Create `apps/server/.env`:

```
SERP_SEARCH_API_KEY=<your-serpapi-key>      # Required: Google search via SerpAPI (Morning Brief search)
ANTHROPIC_API_KEY=<your-anthropic-api-key>  # Required: Morning Brief summarisation
GEMINI_API_KEY=<your-gemini-api-key>        # Optional: alternative LLM provider
OPENAI_API_KEY=<your-openai-api-key>        # Optional: alternative LLM provider
LOG_LEVEL=info                              # Optional: trace|debug|info|warn|error|fatal
```

The client Vite dev server proxies `/api` requests to `http://localhost:3001` automatically.

## Key Conventions

### TypeScript
- Strict mode enabled on both client and server
- Server compiles to CommonJS (`module: commonjs`) via tsup
- Client uses `moduleResolution: bundler` with Vite

### Validation
- All HTTP request inputs validated with Zod schemas in `src/schemas/`
- `validateRequest` middleware runs before controllers and rejects invalid input early

### Logging
- Server uses Pino with pretty-printing and request context
- Each request gets a `requestId` injected via `requestContext` middleware
- Services accept an optional `{ requestId }` context for correlated logging
- Log metrics at end of each pipeline run (URLs found/kept, pages scraped, parse rates)

### Error Handling
- Express error handler middleware catches all unhandled errors, logs them, returns 500
- External API calls use `Promise.allSettled()` — partial failures degrade gracefully
- `scrapePageHtml` uses `validateStatus: () => true` so non-2xx responses don't throw

### CSS Selectors for News Sources
Source-specific CSS selectors live in `apps/server/src/config/sources.ts`. Each source has:
- `domainAllowlist` — accepted URL prefixes
- `excludePatterns` — URL patterns to skip (e.g., `/hub/`, `/topic/`)
- `selectors.title`, `selectors.date`, `selectors.content` — ordered arrays of CSS selectors (first match wins)
- Optional `homepage` config for sources that require scraping the homepage for article URLs

### SVG Imports (Client)
Use the `?react` suffix for SVG imports (vite-plugin-svgr):
```typescript
import MyIcon from './my-icon.svg?react';
```

### LLM Models
Supported summarisation models are declared in `apps/client/src/dataModel/dataModel.ts` (`LLM_MODELS`). The server selects a provider based on the model id and requires the matching API key in env.

## Testing Strategy

### Server (Vitest)
- Unit tests co-located with source files as `*.test.ts`
- External APIs mocked (no real HTTP calls in tests)
- `src/__mocks__/logger.ts` — mock logger to suppress output in tests
- Test fixtures in `src/service/parseHtml/sourcePages.json`

### Client (Vitest)
- Component/unit tests in `src/**/*.test.{ts,tsx}`
- Test setup in `src/test/setup.ts`
- jsdom environment

### Client (Playwright)
- Integration tests in `tests/integration/` — mock API responses via route interception
- Mock responses in `tests/integration/mocks/apiResponses/`
- E2E tests in `tests/e2e/` — full stack (requires both client + server running)
- Config: `playwright.config.ts`

## CI/CD Pipeline (`.github/workflows/ci.yml`)

Three sequential stages, triggered on push to `main`/`master` and on PRs:

1. **build-and-lint**: Install deps → lint client → type-check both → build both
2. **unit-tests**: Matrix [client, server] → run unit tests in parallel
3. **playwright-tests**: Install Playwright browsers → integration tests → E2E tests

## Important Notes

- **Monorepo — no root package.json**: Install dependencies separately in `apps/client/` and `apps/server/`
- **Static serving**: In production, Express serves the built client from `../../client/build` (relative to `apps/server/`)
- **CORS**: Server uses permissive CORS (`Access-Control-Allow-Origin: *`)
- **Node version**: Server requires Node ≥ 22 (`engines` field in `package.json`)
- **SerpAPI**: Codebase uses `serpapi` package. README mentions ScaleSerp — this is outdated; ignore it
- **Express 5**: Server uses Express 5 (`^5.2.1`), which changes some error-handling behavior vs Express 4
- **Tailwind CSS 4**: Client uses Tailwind 4 (not 3) — config syntax differs from older docs

## Gold Standard Files

When adding new features, use these files as canonical examples of each pattern:

| Pattern | Reference file(s) |
|---------|-------------------|
| Service + unit tests | `apps/server/src/service/cleanUrls/cleanUrls.ts` + `cleanUrls.test.ts` — pure function, metrics logging, full coverage across ideal and non-ideal cases |
| Route → controller → schema triple | `apps/server/src/routes/morningBrief.route.ts`, `src/controllers/morningBrief.controller.ts`, `src/schemas/morningBrief.schema.ts` |
| Reusable Express middleware | `apps/server/src/middleware/validateRequest.ts` — generic Zod validation, attaches to `request.validated` |
| Playwright integration test | `apps/client/tests/integration/morning-brief.spec.ts` — route interception mock, user actions, assertions |
| React page with async data | `apps/client/src/pages/MorningBrief/MorningBrief.tsx` + `MorningBrief.test.tsx` |

## Future Plans (from README TODO)
- Stance detection and summarization via ChatGPT API
- AWS deployment via CloudFormation
- Next.js migration (server-side rendering)
- Docker containerization
- Single-spa micro-frontend architecture
