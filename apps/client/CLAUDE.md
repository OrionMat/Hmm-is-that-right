# Client — Claude guidance

React 19 SPA. TypeScript strict mode. Vite build. Tailwind CSS 4.

## Commands (run from `apps/client/`)

```bash
npm run dev              # Vite dev server on port 3000 (proxies /api → 3001)
npm run test:unit        # Vitest run once
npm run lint             # ESLint — 0 warnings allowed
npm run type-check       # tsc --noEmit

# Single-file test (faster feedback)
npx vitest run src/pages/MorningBrief/MorningBrief.test.tsx
npx playwright test tests/integration/morning-brief.spec.ts
```

## Adding a new page

1. Create `src/pages/<PageName>/<PageName>.tsx` (and `<PageName>.test.tsx`).
2. Add the route in `src/navigation/AppRoutes.tsx`.
3. Add the page name constant to `src/pages/PageNames.ts`.
4. Place page-specific sub-components in `src/pages/<PageName>/components/`.

Reference: `src/pages/MorningBrief/` (page with async data fetch, loading state, and results).

## API service layer

- Service files live in `src/service/` — thin axios wrappers only, no UI logic.
- The Vite dev server proxies `/api/*` to `http://localhost:3001` automatically.
- Use `paramsSerializer: { indexes: null }` when passing array query params so they serialise as `sources=bbc&sources=nyt` (not `sources[0]=bbc`).

## SVG imports

Always use the `?react` suffix — vite-plugin-svgr is configured:
```typescript
import MyIcon from './my-icon.svg?react';
```

## Tailwind CSS 4

This project uses Tailwind **4** (not 3). The config syntax differs from older docs:
- No `tailwind.config.js` — configuration is done via CSS `@theme` directives.
- Plugin imported directly in `vite.config.ts` via `@tailwindcss/vite`.

## Testing patterns

**Unit / component tests** (Vitest + jsdom):
- Mock the service layer with `vi.mock("../../service/morningBriefStream")`.
- Use `fireEvent` for user actions, `screen` for queries, `waitFor` for async assertions.
- Reference: `src/pages/MorningBrief/MorningBrief.test.tsx`

**Integration tests** (Playwright):
- Mock API responses with `page.route("**/endpoint?*", ...)`.
- Tests live in `tests/integration/`; mock data in `tests/integration/mocks/apiResponses/`.
- Reference: `tests/integration/morning-brief.spec.ts`

## Data models

Shared interfaces (`NewsPiece`, `HeadlineSummary`, `RelevantNewsPiece`) are intentionally duplicated between `src/dataModel/dataModel.ts` here and `apps/server/src/dataModel/dataModel.ts`. Keep them in sync when changing either.

Client-only types (`NewsSource`, `IsActiveNewsSources`, `LLM_MODELS`) live only in `src/dataModel/dataModel.ts`.
