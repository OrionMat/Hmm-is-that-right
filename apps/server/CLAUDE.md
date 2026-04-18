# Server — Claude guidance

Express 5 API. TypeScript strict mode. Compiled with tsup → `dist/` (CommonJS, Node ≥ 22).

## Commands (run from `apps/server/`)

```bash
npm run dev        # tsx watch on port 3001
npm run test       # Vitest run once
npm run typecheck  # tsc --noEmit

# Single-file test (faster feedback)
npx vitest run src/service/cleanUrls/cleanUrls.test.ts
```

## Request pipeline

Every endpoint follows this exact layer order — do not skip layers or put logic in the wrong one:

```
route (src/routes/)
  → validateRequest middleware (Zod schema from src/schemas/)
  → controller (src/controllers/) — extract params, call service, return JSON
  → service (src/service/)       — orchestrate business logic
  → integration (src/integration/) — external API calls only
```

## Adding a new endpoint

1. **Schema** — create `src/schemas/<name>.schema.ts` with a Zod object. Export inferred type.
2. **Route** — create `src/routes/<name>.route.ts`. Wire `validateRequest({ query/body/params: schema })` before the controller.
3. **Controller** — create `src/controllers/<name>.controller.ts`. Read from `request.validated`, call service, return `response.json(result)`.
4. **Service** — create `src/service/<name>.ts`. Accept optional `{ requestId }` context for logging.
5. **Register** — add router in `src/app.ts`.

Reference triple: `src/routes/getNewsPieces.route.ts` + `src/controllers/getNewsPieces.controller.ts` + `src/schemas/getNewsPieces.schema.ts`

## Logging

```typescript
import { getLogger } from "../../logger";
const logger = getLogger(import.meta.url); // pass filename for scoped logs
logger.info({ requestId, metric: value }, "Description");
```

- Log metrics at the end of each pipeline stage (items in → items out).
- Pass `{ requestId }` from controller through to all service/integration calls.
- Tests mock the logger via `vi.mock("../../logger.ts")` — `src/__mocks__/logger.ts` provides the stub.

## Validation

`validateRequest` middleware (see `src/middleware/validateRequest.ts`):
- Runs Zod `safeParse` on `query`, `body`, and/or `params`.
- On failure: returns `400 { message, errors[] }` — never reaches controller.
- On success: attaches parsed data to `request.validated.query / .body / .params`.

## External API calls

- Use `Promise.allSettled()` for parallel calls — partial failures degrade gracefully.
- `scrapePageHtml` uses `validateStatus: () => true` — non-2xx responses do not throw.
- All external calls live in `src/integration/`; services must not call `axios` directly.

## Adding a new news source

Edit `src/config/sources.ts`:
1. Add entry to `sourceConfigs` with `domainAllowlist`, optional `excludePatterns`, and `selectors` (ordered arrays — first match wins).
2. Add corresponding entry to `permanentSourceUrls` in `apps/client/src/dataModel/dataModel.ts`.
