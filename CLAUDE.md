# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Hmm is that right?" is a fact-checking web application that automates cross-checking news statements across multiple sources. Users enter a statement, select news sources, and the app scrapes and displays related articles for comparison.

## Repository Structure

This is a monorepo under `apps/` with separate client and server packages:

```
/
├── apps/
│   ├── client/          # React SPA (frontend)
│   └── server/          # Express API (backend)
├── CLAUDE.md
├── README.md
└── code-review-checklist.md
```

## Architecture

### Client (React SPA)
- **Location**: `apps/client/src/`
- **Framework**: React 19 with React Router v6
- **Styling**: Tailwind CSS 4.2.1
- **Build**: Vite 6.2.5 with TypeScript 5.9.3
- **Testing**: Vitest (unit), Playwright (integration/E2E)

**Key Structure**:
```
apps/client/src/
├── index.tsx                    # App entry point
├── navigation/
│   ├── AppRoutes.tsx            # Route definitions
│   └── AppNavigation.tsx        # Navigation component
├── pages/
│   ├── PageNames.ts             # Route path constants
│   ├── ErrorPage.tsx
│   ├── Home/                    # Home page with Cards and Pills
│   ├── FactCheck/               # Main fact-check feature
│   │   └── components/          # SearchBar, ResultsTable, Tile
│   ├── Academics/               # Quiz feature
│   │   └── components/          # Question, QuizCard, ProgressBar, Options, ResultsScreen
│   └── SignUp/
├── components/                  # Shared UI: LoadingSpinner, PageContainer, Arrow, Cross, Tick
├── service/
│   └── getNewsPieces.ts         # API client for news endpoint
├── services/
│   └── quizService.ts           # API client for quiz endpoint
├── dataModel/
│   ├── dataModel.ts             # NewsPiece, NewsSource interfaces
│   └── quizModel.ts             # Quiz interfaces
├── hooks/
│   └── useQuiz.ts               # Quiz state management hook
├── icons/                       # 27 icon components (NewsIcons, BrowserIcon, ClaudeIcon, etc.)
├── constants/
│   └── quiz.ts
└── test/
    └── setup.ts                 # Vitest/Testing Library setup, SVG mock
```

**Playwright tests** live at `apps/client/tests/`:
```
tests/
├── e2e/example.spec.ts
└── integration/
    ├── fact-check.spec.ts       # Mocked integration tests
    ├── academics.spec.ts
    └── mocks/apiResponses/      # Mock API response data
```

### Server (Express API)
- **Location**: `apps/server/src/`
- **Framework**: Express 5 with Pino logging
- **Build**: tsup (TypeScript → `apps/server/dist/`)
- **Runtime**: Node.js >=22

**Key Structure**:
```
apps/server/src/
├── index.ts                     # Entry point, starts on port 3001
├── app.ts                       # Express app, routes, middleware wiring
├── logger.ts                    # Pino logger (configurable via LOG_LEVEL)
├── config/
│   ├── serverConfig.ts          # Reads .env (SERP_SEARCH_API_KEY, LOG_LEVEL)
│   └── sources.ts               # Per-source CSS selectors, domain allowlists, exclude patterns
├── routes/
│   ├── getNewsPieces.route.ts   # GET /getNewsPieces
│   └── quiz.route.ts            # /api/quiz
├── controllers/
│   ├── getNewsPieces.controller.ts
│   └── quiz.controller.ts
├── middleware/
│   ├── validateRequest.ts       # Zod schema validation, attaches to request.validated
│   ├── requestContext.ts        # UUID request ID (X-Request-Id header)
│   └── errorHandler.ts          # Global error handler → 500
├── schemas/
│   ├── getNewsPieces.schema.ts  # Zod: statement (string), sources (string | string[])
│   └── quiz.schema.ts
├── service/
│   ├── getNewsPieces.ts         # Main orchestration service
│   ├── cleanUrls/               # URL filtering and deduplication
│   └── parseHtml/               # JSDOM parsing with CSS selectors
├── integration/
│   ├── googleSearch/            # SerpAPI integration
│   ├── scrapePageHtml/          # Axios HTML scraping (10s timeout, Chrome UA)
│   └── openAIService.ts         # OpenAI integration
├── dataModel/
│   └── dataModel.ts             # SourceUrls, SourcePages, NewsPiece, RelevantNewsPiece
├── types/
│   └── express.d.ts             # Augments Request with id and validated fields
└── __mocks__/
    └── logger.ts                # Mock logger for tests
```

### Data Flow

1. User enters statement + selects sources in **SearchBar** on FactCheck page
2. Client calls `GET /getNewsPieces?statement=...&sources=...`
3. **validateRequest** middleware validates with Zod schema
4. **requestContext** middleware attaches a UUID request ID
5. **getNewsPiecesController** calls **getNewsPieces** service
6. Service orchestrates:
   - `googleSearch()` → SerpAPI → `SourceUrls`
   - `cleanUrls()` → filters by domain allowlist, removes excluded patterns → `SourceUrls`
   - `scrapePageHtml()` → parallel axios scraping with `Promise.allSettled` → `SourcePages`
   - `parseHtmlWithMetrics()` → JSDOM + CSS selectors from `sources.ts` → `NewsPiece[]`
7. Service logs scraping metrics and returns `NewsPiece[]`
8. Client renders results in **ResultsTable**

**NewsPiece type**:
```typescript
interface NewsPiece {
  url: string;
  title: string | null;
  date: string | null;
  body: (string | null)[];
  source: "bbc" | "nyt" | "ap" | "reuters" | "twitter";
}
```

## Development Commands

### Server
**Working directory**: `apps/server/`

| Command | Description |
|---|---|
| `npm run dev` | Watch mode with `tsx watch` (auto-reloads on TS changes) |
| `npm run build` | Bundle TypeScript to `dist/` with tsup |
| `npm run start` | Run built server (`node ./dist/index.js`) on port 3001 |
| `npm run test` | Vitest unit test suite (single run) |
| `npm run typecheck` | TypeScript type check without emit |

### Client
**Working directory**: `apps/client/`

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server on port 3000 (proxies `/api` to port 3001) |
| `npm run build` | TypeScript check + Vite production build to `build/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint with 0 max warnings |
| `npm run type-check` | TypeScript type check without emit |
| `npm run test` | Vitest watch mode (unit tests) |
| `npm run test:unit` | Vitest single run |
| `npm run test:integration` | Playwright integration tests |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test:create` | Playwright codegen at `http://localhost:3000` |

## Environment Setup

Create `apps/server/.env`:
```
SERP_SEARCH_API_KEY=<your-serpapi-key>
LOG_LEVEL=info   # optional, default: info
```

## Key Conventions

### TypeScript
- Both client and server use **strict mode** with TypeScript 5.9.3
- Server compiles to CommonJS (`"module": "commonjs"`) via tsup into `dist/`
- Client uses ESNext modules, compiled by Vite (no `outDir`)
- Express `Request` is augmented in `types/express.d.ts` to add `id: string` and `validated: { query, body, params }`

### Validation
- All request validation uses **Zod schemas** in `server/src/schemas/`
- The `validateRequest` middleware attaches parsed data to `request.validated` — controllers should read from there, not raw `req.query`/`req.body`

### Logging
- Use the Pino logger from `server/src/logger.ts` — never `console.log` on the server
- Log level controlled by `LOG_LEVEL` env var
- Include structured context (requestId, source, metrics) in log calls

### Testing
- Server tests use **Vitest** (`*.test.ts` files co-located with source)
- Client unit tests use **Vitest + Testing Library** (co-located `*.test.tsx` files)
- Client integration/E2E tests use **Playwright** in `tests/integration/` and `tests/e2e/`
- Use `__mocks__/logger.ts` to mock the logger in server tests
- Mock SVG imports are handled in `client/src/test/setup.ts`

### SVG Imports
Client uses `vite-plugin-svgr`. Import SVGs as React components with the `?react` suffix:
```typescript
import MyIcon from './my-icon.svg?react';
```

### Styling
Client uses **Tailwind CSS 4** (via `@tailwindcss/vite` plugin). Use utility classes directly in JSX — no separate CSS files or styled-components.

### Client Routing
Routes are defined in `AppRoutes.tsx` using React Router v6:
- `/` → Home
- `/fact-check` → FactCheck (main feature)
- `/academics` → Academics quiz
- `/sign-up` → SignUp
- `/messenger`, `/market`, `/account` → Placeholder pages

### Source Configuration
CSS selectors for scraping each news source live in `apps/server/src/config/sources.ts`. Each source entry includes:
- `titleSelectors` / `dateSelectors` / `bodySelectors` — ordered CSS selector arrays
- `domains` — allowlist of accepted URL domains
- `excludePatterns` — URL patterns to filter out (e.g. NYT `/interactive/`)

### CORS
Server has permissive CORS (`Access-Control-Allow-Origin: *`). Do not restrict without updating the client's API base URL configuration.

### Static File Serving
The server serves the built client from `apps/client/build/` at the root path. Run `npm run build` in `apps/client/` before relying on static serving.

## Important Notes

- **Monorepo**: `apps/client` and `apps/server` are independent npm packages with separate `node_modules/`. Run `npm install` in each.
- **Build outputs**: Server → `apps/server/dist/`, Client → `apps/client/build/`
- **SerpAPI**: The server uses `SERP_SEARCH_API_KEY` for Google search via SerpAPI (migrated from ScaleSerp)
- **OpenAI**: `openAIService.ts` exists for potential ChatGPT-powered stance detection/summarization (not fully integrated)
- **Request IDs**: Every request gets a UUID attached as `request.id` and returned in the `X-Request-Id` response header; pass `X-Request-Id` or `X-Trace-Id` headers to propagate IDs
