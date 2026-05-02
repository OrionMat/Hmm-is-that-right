# Morning Brief — Feature Documentation

> Last analysed: branch `claude/analyze-morning-brief-OZbnG`  
> Purpose: give future agents enough context to extend the feature without re-reading the entire codebase.

---

## What it does

Morning Brief generates a personalised daily intelligence briefing on demand. The user clicks "Get My Brief" and three sections stream in progressively:

| Section | What it covers | Articles picked |
|---|---|---|
| **World Headlines** | Global news | 2 |
| **Tech & AI** | Tech/AI industry | 2 |
| **Long-Form Insight** | One deep-dive, mode-rotated daily | 1 |

The longform section rotates through three modes on a day-of-year cycle (`dayOfYear % 3`):

- **zoom-in** — mechanism and depth; how something actually works
- **zoom-out** — bigger patterns, strategy, essays
- **inversion** — counterintuitive angles; where consensus is wrong

Summaries stream token-by-token via SSE so the UI feels responsive even while the LLM is working.

---

## File map

### Server (`apps/server/src/`)

| File | Role |
|---|---|
| `routes/morningBrief.route.ts` | Registers `GET /api/morning-brief/stream` |
| `schemas/morningBrief.schema.ts` | Zod schema: optional `date` (YYYY-MM-DD) and `nocache=1` |
| `controllers/morningBrief.controller.ts` | SSE orchestrator — concurrency gate, cache check, section fan-out |
| `service/morningBrief/buildSection.ts` | Two-stage pipeline (select → scrape → summarise) + streaming callbacks |
| `service/morningBrief/sectionSpecs.ts` | Per-section candidate-fetching logic and source definitions |
| `service/morningBrief/modeRotation.ts` | `getModeForDate(d)` — `dayOfYear(d) % 3` → `LongformMode` |
| `service/morningBrief/prompts.ts` | LLM prompt builders for Stage-1 selection and Stage-2 summarisation |
| `service/morningBrief/personalContext.ts` | Loads `context/personalContext.md` at startup |
| `service/morningBrief/cache.ts` | In-memory TTL cache (`cacheGet/cacheSet/cacheKey`) |
| `dataModel/dataModel.ts` | All Morning Brief TypeScript interfaces (source of truth) |
| `config/serverConfig.ts` | `morningBriefCacheTtlMs` (env: `MORNING_BRIEF_CACHE_TTL_MS`, default 6 h) |

### Client (`apps/client/src/`)

| File | Role |
|---|---|
| `pages/MorningBrief/MorningBrief.tsx` | Page component — state machine, SSE wiring, layout |
| `pages/MorningBrief/components/BriefSection.tsx` | Section card (title, spinner, item list, error) |
| `pages/MorningBrief/components/BriefItem.tsx` | Individual article: title link, source, streaming summary |
| `pages/MorningBrief/components/ModeBadge.tsx` | Colour-coded pill for longform mode |
| `pages/MorningBrief/components/BehindTheScenes.tsx` | Collapsible diagnostics panel |
| `pages/MorningBrief/sectionTitles.ts` | `SECTION_TITLE` record mapping section keys to display strings |
| `service/morningBriefStream.ts` | `EventSource` wrapper — typed SSE event dispatch |
| `utils/formatMs.ts` | `fmtMs(ms)` — formats milliseconds as `123ms` or `1.2s` |
| `dataModel/dataModel.ts` | Client-side copy of Morning Brief interfaces (must stay in sync with server) |

### Tests

| File | What it covers |
|---|---|
| `apps/server/src/controllers/morningBrief.controller.test.ts` | Controller unit tests |
| `apps/server/src/service/morningBrief/buildSection.test.ts` | Pipeline unit tests |
| `apps/server/src/service/morningBrief/modeRotation.test.ts` | Mode rotation unit tests |
| `apps/server/src/service/morningBrief/cache.test.ts` | Cache unit tests |
| `apps/client/src/pages/MorningBrief/MorningBrief.test.tsx` | Page component unit tests |
| `apps/client/tests/integration/morning-brief.spec.ts` | Playwright integration tests |
| `apps/client/tests/integration/mocks/apiResponses/morningBrief/` | SSE mock payloads (happyPath, sectionError, allError, cacheHit) |

---

## End-to-end request flow

```
User clicks "Get My Brief"
  → subscribeMorningBrief()             opens EventSource to /api/morning-brief/stream
  → validateRequest middleware           checks date / nocache query params (Zod)
  → morningBriefController
      ├─ IP concurrency gate             429 if same IP already in flight
      ├─ SSE headers + keepalive         flushHeaders(), setNoDelay(), 15 s comments
      ├─ getModeForDate()                dayOfYear % 3 → zoom-in | zoom-out | inversion
      ├─ emit section_start × 3          client shows spinners immediately
      └─ Promise.allSettled([world, tech, longform])
            ├─ cacheGet(key)             hit → emit section_complete + section_diagnostics, return
            └─ buildSection(spec, ...)   miss → run two-stage pipeline
                  Stage 1 — Candidate fetching
                    spec.fetchCandidates()  → fetch RSS / HN / Reddit / PG essays
                    selectCandidates()      → LLM picks best N (claude-sonnet-4-6)
                    onSectionReady()        → emit section_complete with empty summaries
                  Stage 2 — Scrape + summarise
                    scrapePickedContent()   → scrapePageHtml() + parseHtmlWithMetrics()
                    summarisePicked()       → llmService.completeStream() per article
                      onSummaryChunk()      → emit summary_chunk (token delta)
                      onSummaryDone()       → emit summary_done
                  cacheSet(key, result, ttl)
                  emit section_diagnostics
  → emit done                            client closes EventSource, re-enables button
```

---

## SSE event reference

All events are `text/event-stream` with JSON `data` fields.

| Event | Payload | When |
|---|---|---|
| `section_start` | `{ section, mode? }` | Before any I/O — triggers spinner |
| `section_complete` | `SectionPayload` | After Stage-1 selection (summaries may be `""`) |
| `summary_chunk` | `{ section, url, delta }` | Each LLM token during Stage-2 |
| `summary_done` | `{ section, url }` | One article's summary finished |
| `section_diagnostics` | `SectionDiagnostics` | After section pipeline completes |
| `section_error` | `{ section, message }` | If a section throws |
| `done` | `{}` | All sections complete |

---

## Data models (key interfaces)

```typescript
// The three fixed section keys
type MorningBriefSection = "world" | "tech" | "longform"
type LongformMode = "zoom-in" | "zoom-out" | "inversion"

// What gets rendered per article
interface BriefItem { title, url, source, summary }

// section_complete payload
interface SectionPayload { section, mode?, items: BriefItem[], generatedAt }

// section_diagnostics payload — drives BehindTheScenes panel
interface SectionDiagnostics {
  section, mode?, cacheHit, llmModel, selectionMethod,
  personalContextUsed,
  sources: SourceQueryResult[],   // per upstream source: status + article count
  candidates: CandidateMeta[],    // all headlines considered; .picked flags winners
  scrapes: ScrapeAttempt[],       // per picked article: scraped | prefetched | snippet-fallback
  durations: SectionDurations,    // fetchCandidatesMs, selectionMs, scrapingMs, summarisationMs, totalMs
}
```

Client and server each have a copy of these interfaces (`dataModel/dataModel.ts`). **Keep them in sync** when adding fields.

---

## Sources per section

### World
- RSS: `bbc`, `ap`, `reuters` (via `fetchRssFeedsWithStatus`)

### Tech
- Hacker News top 30 stories (min score 50), up to 15 used as candidates
- RSS: `theBatch`, `anthropicBlog`, `githubBlog`

### Longform — zoom-in
- HN top 30 (min score 100), top 10 used
- RSS: `anthropicBlog`, `githubBlog` (3 articles each)

### Longform — zoom-out
- 5 random Paul Graham essays (shuffled from full list)
- HN stories with >50 comments, top 5
- RSS: `theBatch` (3 articles)

### Longform — inversion
- HN stories with >50 comments, top 8
- Reddit: `r/ExperiencedDevs`, `r/MachineLearning`, `r/cscareerquestions` (5 posts each, weekly top)
- Reddit self-post text is pre-loaded as `content` — skips scraping

RSS feed config lives in `apps/server/src/config/rssFeeds.ts`. Source-specific CSS selectors for scraping live in `apps/server/src/config/sources.ts`.

---

## LLM usage

Both stages use **`claude-sonnet-4-6`** (hardcoded as `LLM_MODEL` in `buildSection.ts`).

### Stage 1 — selection (`buildSelectionPrompt`)
- Lists all candidates with `[id] title (source, score)` + optional snippet (200 chars)
- Includes mode hint and personal context
- Expects strict JSON: `{"picks": ["c0", "c3"]}`
- On parse failure: one retry with "Return ONLY the JSON object" suffix
- On retry failure: falls back to top-by-score (`selectionMethod: "score-fallback"`)

### Stage 2 — summarisation (`buildSummaryPrompt`)
- **Full content path** (≥500 chars): 3-5 sentence tight summary, mode-specific closing instruction, personal context woven in
- **Snippet path** (<500 chars): explicitly instructs Claude not to hallucinate beyond what the snippet says
- Content is capped at 6,000 chars
- Uses `llmService.completeStream()` — async generator yielding token deltas

---

## Personalisation

`apps/server/context/personalContext.md` is loaded once at server startup by `personalContext.ts`. It falls back to `personalContext.example.md` if the real file is missing. The text is injected verbatim into both the selection and summary prompts.

To personalise a deployment: create `apps/server/context/personalContext.md` describing the user's interests, role, and reading preferences.

---

## Caching

- **Store**: in-memory `Map` in `cache.ts` — no external dependency
- **TTL**: default 6 hours, override via `MORNING_BRIEF_CACHE_TTL_MS` env var
- **Key**: `{YYYY-MM-DD}:{section}[:{mode}]` — longform includes mode so zoom-in and zoom-out on the same day don't collide
- **Bypass**: `?nocache=1` query param (useful in development)
- **On cache hit**: stored timings are zeroed; `totalMs` reflects the actual serve time (sub-ms); `cacheHit: true` set in diagnostics

---

## Concurrency and abort handling

- One SSE connection per client IP is allowed (`inFlight` Set in controller). A second request while one is running gets a `429`.
- An `AbortController` is created per request. If the client disconnects mid-stream, `request.on("close")` aborts it, which propagates into `buildSection` and `llmService` calls.
- `streamCompleted` flag prevents false-positive abort detection on the normal TCP close that follows `response.end()`.

---

## BehindTheScenes diagnostics panel

Rendered by `BehindTheScenes.tsx` once any section has received a `section_diagnostics` event. It is a `<details open>` element with `aria-hidden="true"` on its content (so Playwright link matchers don't double-count links).

Each section sub-panel shows:

1. **Sources checked** — name, status glyph (✓ ok / ∅ empty / ✗ failed), article count, error message if failed
2. **Headlines considered** — all candidates ordered by original fetch order; picked ones are bold + "· picked" in green; links open in new tab
3. **Scrape outcomes** — per picked article: ✓ scraped / ✓ pre-fetched / ✗ snippet fallback, with character count
4. **Pipeline** — selection method, whether personal context was applied, stage timings or "served from cache (Xms)"

---

## Adding a new section

1. Add the new key to `MorningBriefSection` in both `dataModel.ts` files.
2. Add a new spec factory to `sectionSpecs.ts` following the `SectionSpec` interface.
3. Instantiate the spec in the controller's `sections` array.
4. Emit a `section_start` for the new section at the top of the controller.
5. Add the key to `SECTION_TITLE` in `sectionTitles.ts`.
6. Add the section to `INITIAL_STATE` and the render list in `MorningBrief.tsx`.
7. Add mock SSE payloads to the Playwright integration test mocks.

## Adding a new longform mode

1. Add the mode string to `LongformMode` in both `dataModel.ts` files.
2. Add it to the `MODES` array in `modeRotation.ts`.
3. Add selection hint and summary instruction entries to `MODE_SELECTION_HINT` / `MODE_SUMMARY_INSTRUCTION` in `prompts.ts`.
4. Add candidate-fetching logic for the new mode branch in `longformSpec()` in `sectionSpecs.ts`.
5. Add the colour to `MODE_COLOUR` and label to `MODE_LABEL` in `ModeBadge.tsx`.

## Adding a new data source

- **RSS**: add a feed config to `apps/server/src/config/rssFeeds.ts` and reference the key in the relevant `sectionSpecs.ts` fetch call.
- **Custom API**: add an integration module under `apps/server/src/integration/` following the pattern of `hackerNews/` or `reddit/`, then wire it into `sectionSpecs.ts`.

---

## Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `MORNING_BRIEF_CACHE_TTL_MS` | No | `21600000` (6 h) | How long a generated brief is cached |

The LLM API key needed is `ANTHROPIC_API_KEY` (used by `llmService`).
