# Plan: "While You Were Away" — gap-aware Morning Brief catchup

## Context

The Morning Brief currently regenerates a flat 3-section daily brief regardless of how long it's been since the user last checked. After a multi-day or multi-week gap, that's the wrong shape — most "today's news" is irrelevant churn, and the user is missing the *arcs* that actually moved.

This plan adds a new top section, **"While You Were Away,"** that compresses the gap into 3–5 narrative arcs with current-state summaries. It triggers when the gap ≥ 1 day, optimises for the ~1-month case, and uses lazy on-demand backfill (no cron). Single-user; persistence via JSON files on disk.

User decisions locked in:
1. Catchup section appears **above** the standard World/Tech/Long-form (does not replace).
2. Backfill uses **SerpAPI date-range queries + Wikipedia Current Events portal**.
3. Persistence is **JSON files** under `data/` (no DB, no new deps for storage).

## Approach

A new `buildCatchup()` service mirrors the existing `buildSection()` two-stage pattern:

- **Stage 1 (cluster)**: pull candidates from the gap window via SerpAPI date-range, Wikipedia Current Events, and any persisted snapshots; ask Claude to cluster them into 3–5 arcs with status + why-matters; one retry on JSON parse failure (mirroring `tryParsePicksJson`).
- **Stage 2 (summarise)**: stream a "current state, with context" summary per arc, in parallel.

Catchup runs as a **fourth parallel branch** of the existing controller's `Promise.allSettled` array — same SSE response writer, same abort signal, same in-memory cache. After all sections complete successfully, the controller persists today's snapshot and updates `lastSeen`.

## Data model additions

`apps/server/src/dataModel/dataModel.ts` (mirror in `apps/client/src/dataModel/dataModel.ts`):

```ts
export type ArcStatus = "developing" | "concluded" | "fizzled";

export interface BriefArc {
  id: string;                  // stable id, e.g. "a0", "a1"
  title: string;
  status: ArcStatus;
  whyMatters: string;
  summary: string;             // streamed in Stage 2; empty in skeleton
  representativeUrls: Array<{ title: string; url: string; source: string; date: string }>;
  firstSeen: string;           // ISO
  lastUpdate: string;          // ISO
}

export interface CatchupPayload {
  section: "catchup";
  gapDays: number;
  lastBriefAt: string;         // ISO
  arcs: BriefArc[];
  generatedAt: string;
}

export interface CatchupChunkPayload {
  arcId: string;
  delta: string;
}

export interface CatchupDonePayload {
  arcId: string;
}
```

Do **not** add `"catchup"` to `MorningBriefSection` — the existing union is item-shaped, catchup is arc-shaped. Keep it parallel.

## New SSE events

Emit only when `gapDays >= 1`:
- `catchup_start` — `{ gapDays, lastBriefAt }` (immediate, before any work)
- `catchup_ready` — `CatchupPayload` (after Stage 1 cluster — arcs with empty summary strings, drives skeleton render)
- `catchup_arc_chunk` — `CatchupChunkPayload`
- `catchup_arc_done` — `CatchupDonePayload`
- `catchup_error` — `{ message }` (fatal; cluster failed twice, all backfill empty, etc.)

`catchup_complete` is **not** needed — `catchup_ready` carries the final shape; arc summaries fill in via chunk/done.

## Server: new files

| File | Purpose |
|---|---|
| `apps/server/src/service/morningBrief/lastSeen.ts` | `getLastSeen(): Promise<Date \| null>`, `setLastSeen(d: Date): Promise<void>`. Reads/writes `data/state.json`. Atomic write-then-rename. |
| `apps/server/src/service/morningBrief/snapshots.ts` | `saveSnapshot(date: string, payload: BriefSnapshot)`, `loadSnapshotsBetween(from: Date, to: Date): Promise<BriefSnapshot[]>`. Files: `data/briefs/{YYYY-MM-DD}.json`. Schema versioned (`schemaVersion: 1`). |
| `apps/server/src/service/morningBrief/buildCatchup.ts` | Orchestrates the two-stage catchup pipeline. Signature mirrors `buildSection`: `buildCatchup(lastSeen, personalCtx, requestId, signal, callbacks)`. Callbacks: `onCatchupReady(payload)`, `onSummaryChunk(arcId, delta)`, `onSummaryDone(arcId)`. |
| `apps/server/src/service/morningBrief/clusterArcs.ts` | `clusterIntoArcs(candidates, gapDays, lastSeen, personalCtx, signal): Promise<RawArc[]>`. Mirrors `selectCandidates` in `buildSection.ts:135`: one retry with JSON-only reminder, returns `[]` on second failure. |
| `apps/server/src/service/morningBrief/catchupPrompts.ts` | `buildClusterPrompt(...)`, `buildArcSummaryPrompt(...)`. |
| `apps/server/src/integration/wikipediaCurrentEvents/wikipediaCurrentEvents.ts` | `fetchCurrentEvents(from: Date, to: Date): Promise<WikiEvent[]>`. Sequential fetch (in-process semaphore, 1 in-flight) with custom User-Agent. Multiple selector fallbacks per `parseHtml.ts` idiom. Returns empty array on 404. |

## Server: modified files

### `apps/server/src/integration/googleSearch/googleSearch.ts`

Add a sibling function (do **not** extend `googleSearch` — its `SourceUrls` return shape is wrong for catchup):

```ts
export interface DatedSearchResult {
  title: string;
  link: string;
  snippet?: string;
  date?: string;          // SerpAPI `date` field when present
  source?: string;
}

export async function googleSearchDateRange(
  query: string,
  dateRange: { from: Date; to: Date },
  num = 10,
): Promise<DatedSearchResult[]>;
```

Builds SerpAPI param `tbs=cdr:1,cd_min:MM/DD/YYYY,cd_max:MM/DD/YYYY` (US slash format). Existing fact-check callers and `googleSearch.test.ts` are untouched.

### `apps/server/src/controllers/morningBrief.controller.ts`

Modifications, in order:
1. Before line 50, read `getLastSeen()` and compute `gapDays` (whole days between `lastSeen` and `date`).
2. If `gapDays >= 1`, emit `catchup_start` with `{ gapDays, lastBriefAt }` alongside the existing three `section_start` events at lines 50–52.
3. Add catchup as the first element of the `sections` array at line 67 (so it starts at the same instant). Wrap its handler body in `try/catch` matching the existing per-section pattern (lines 77–117): emit `catchup_ready`, wire chunk/done callbacks, emit `catchup_error` on failure.
4. After `Promise.allSettled` resolves and **before** `emit(response, "done", {})` at line 128, **await** two writes:
   - `saveSnapshot(dateStr, { schemaVersion: 1, world, tech, longform, catchup? })`
   - `setLastSeen(date)` — only if `!ac.signal.aborted` AND no fatal catchup error (otherwise the gap silently disappears on retry)
5. The keepalive/abort flow stays unchanged.

### `apps/server/src/schemas/morningBrief.schema.ts`

Add optional debug field:
```ts
simulateLastSeen: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
```
Gate its application in the controller on `serverConfig.loggingLevel === "debug" || "trace"`.

### `apps/server/src/dataModel/dataModel.ts`

Add the types listed above. Add internal types in `buildCatchup.ts` only:
```ts
interface CatchupCandidate {
  id: string;
  title: string;
  source: string;
  url: string;
  date: string;            // ISO
  snippet?: string;
}

interface BriefSnapshot {
  schemaVersion: 1;
  date: string;
  world?: SectionPayload;
  tech?: SectionPayload;
  longform?: SectionPayload;
  catchup?: CatchupPayload;
}
```

## Client: new + modified files

| File | Change |
|---|---|
| `apps/client/src/dataModel/dataModel.ts` | Mirror `BriefArc`, `CatchupPayload`, `CatchupChunkPayload`, `CatchupDonePayload`, `ArcStatus`. |
| `apps/client/src/service/morningBriefStream.ts` | Add handlers: `onCatchupStart`, `onCatchupReady`, `onCatchupArcChunk`, `onCatchupArcDone`, `onCatchupError`. |
| `apps/client/src/pages/MorningBrief/components/CatchupSection.tsx` (new) | Renders gap header ("Since Apr 7 — 30 days"), arc cards with title, status pill, whyMatters, streaming summary, representative source links. Mostly parallel code to `BriefSection.tsx` — accept the duplication; arcs and items have different shapes. |
| `apps/client/src/pages/MorningBrief/MorningBrief.tsx` | Add `catchup` slot to component state, defaulting to **absent** (not `idle`) — only renders when `catchup_ready` arrives. Insert above the existing three sections at line 104. Streaming chunk handler keys on `arcId` instead of `url`. |

## Pipeline: `buildCatchup`

1. **Window the gap**: split `[lastSeen, now]` into weekly windows. **Clamp at 6 windows** so a 6-month gap doesn't 6× SerpAPI spend.
2. **Backfill in parallel per window**:
   - SerpAPI: `googleSearchDateRange("top news stories", window, 10)` plus 1 personal-context-derived query (e.g. "AI policy") — gated by `serverConfig.morningBriefCatchupQueriesPerWindow` (default 1).
   - Wikipedia: `fetchCurrentEvents(window.from, window.to)` — sequential fetches, custom UA `"hmm-is-that-right/1.0 (single-user research)"`.
   - Snapshots: `loadSnapshotsBetween(window.from, window.to)` — extract `BriefItem`s from any saved sections.
3. **Aggregate** into `CatchupCandidate[]` with stable ids `c0..cN`. Filter SerpAPI results whose returned `date` falls outside the gap window (~10% noise per Plan agent observation).
4. **Stage 1 — cluster**: `clusterIntoArcs(...)` → `RawArc[]`. On second parse failure: emit `catchup_error("Could not cluster events")` and abort the catchup branch. Do **not** fabricate arcs.
5. Build skeleton `CatchupPayload` (arcs with empty `summary`, `representativeUrls` resolved from `candidate_ids`). Emit `catchup_ready`.
6. **Stage 2 — summarise per arc, in parallel**:
   - Best-effort scrape top 1–2 representative URLs via `scrapePageHtml` (reuse existing integration).
   - Stream `llmService.completeStream(buildArcSummaryPrompt(arc, contents, gapDays), "claude-sonnet-4-6", signal)` → emit `catchup_arc_chunk` per delta, `catchup_arc_done` per arc.
7. Cache the final payload in the existing in-memory cache: key `cacheKey(today, "catchup", lastBriefDate)` — using date-only strings (no colons in ISO times). TTL = 6h.

## Cluster prompt JSON contract

Mirror `tryParsePicksJson` pattern in `buildSection.ts:177` exactly. Schema requested:

```json
{
  "arcs": [
    {
      "title": "AI export controls tighten",
      "status": "developing",
      "why_matters": "Affects Anthropic and Nvidia access to China",
      "candidate_ids": ["c4", "c12", "c19"]
    }
  ]
}
```

Defensive parse: drop arcs whose `candidate_ids` reference unknown ids; clamp `arcs.length` to 5; coerce unknown `status` values to `"developing"`.

## Persistence layer

```
data/
  state.json               # { schemaVersion: 1, lastBriefAt: ISO }
  briefs/
    2026-04-07.json        # BriefSnapshot
    2026-04-14.json
    ...
```

- Lazy `fs.mkdir(dir, { recursive: true })` per write — no startup hook.
- Atomic write: `writeFile(tmp) → rename(tmp, final)` (safe under abort).
- No locking needed: existing `inFlight` IP guard at controller line 15 already serialises briefs per client.
- Path: `path.join(process.cwd(), "data", ...)` — matches `personalContext.ts:9` idiom.
- Add `data/` to `.gitignore`.

## Personal context

Pass `personalContext` (string) and a separate one-line preamble (`"Last brief: ${lastBriefAt}. Gap: ${gapDays} days."`) into the cluster + arc prompts. **No structured signal** — the existing string-based interface is sufficient. (Optional follow-up, not in this plan: add a "topics I track" section to `context/personalContext.md`.)

## Key decisions & failure modes

| Concern | Decision |
|---|---|
| Catchup runs in parallel with sections | Yes — fourth element in the existing `Promise.allSettled` array (not detached). |
| Cluster fails twice | Emit `catchup_error`; do **not** fabricate arcs. |
| All backfill sources empty | Same as cluster failure — `catchup_error("No events found in gap window")`. |
| Abort mid-stream | `setLastSeen` is **not** called; gap preserved for retry. Snapshot also skipped. |
| SerpAPI date filter is loose | Filter SerpAPI results client-side using returned `date` field; drop undated. |
| Wikipedia DOM changes | Multi-selector fallbacks (`.vevent`, `div[role="region"] > ul`, `.description ul`); parser returns `{ events, parseFailures }`; warn log when `events === 0 && parseFailures > 0`. |
| SerpAPI cost | Clamp windows at 6; default 1 query/window via `serverConfig.morningBriefCatchupQueriesPerWindow`. |
| Wikipedia rate limit | Sequential fetch (1-deep promise chain) with custom UA; do **not** reuse `scrapePageHtml`'s Chrome UA. |
| Cache key with ISO timestamps | Use date-only `YYYY-MM-DD` strings — `cacheKey()` already uses `:` separator so embedding ISO times would collide. |

## Files to modify (paths summary)

**New (server):**
- `apps/server/src/service/morningBrief/lastSeen.ts`
- `apps/server/src/service/morningBrief/snapshots.ts`
- `apps/server/src/service/morningBrief/buildCatchup.ts`
- `apps/server/src/service/morningBrief/clusterArcs.ts`
- `apps/server/src/service/morningBrief/catchupPrompts.ts`
- `apps/server/src/integration/wikipediaCurrentEvents/wikipediaCurrentEvents.ts`

**Modified (server):**
- `apps/server/src/controllers/morningBrief.controller.ts`
- `apps/server/src/integration/googleSearch/googleSearch.ts` (add sibling function)
- `apps/server/src/schemas/morningBrief.schema.ts` (debug param)
- `apps/server/src/dataModel/dataModel.ts`
- `apps/server/src/config/serverConfig.ts` (add `morningBriefCatchupQueriesPerWindow`, `morningBriefCatchupMaxWindows`)

**New (client):**
- `apps/client/src/pages/MorningBrief/components/CatchupSection.tsx`

**Modified (client):**
- `apps/client/src/pages/MorningBrief/MorningBrief.tsx`
- `apps/client/src/service/morningBriefStream.ts`
- `apps/client/src/dataModel/dataModel.ts`

**Other:**
- `.gitignore` (add `data/`)

## Tests

Mirror existing Vitest patterns in `apps/server/src/service/morningBrief/*.test.ts` (`vi.hoisted` + `vi.mock` for `llmService`, `scrapePageHtml`, `logger`).

| File | Cases |
|---|---|
| `service/morningBrief/lastSeen.test.ts` | (1) `null` when state.json absent, (2) round-trip Date through set→get, (3) atomic-rename: no partial file visible mid-write |
| `service/morningBrief/snapshots.test.ts` | (1) saveSnapshot creates file, (2) loadSnapshotsBetween filters dates inclusively, (3) missing date returns null without throwing |
| `service/morningBrief/clusterArcs.test.ts` | (1) parses valid JSON, (2) retries on parse failure, (3) returns `[]` on second failure, (4) drops unknown candidate_ids, (5) clamps to 5 arcs |
| `service/morningBrief/buildCatchup.test.ts` | (1) emits onCatchupReady then chunks per arc, (2) handles all-empty backfill, (3) respects abort signal between stages, (4) caches result on success |
| `integration/wikipediaCurrentEvents/wikipediaCurrentEvents.test.ts` | (1) parses fixture HTML, (2) returns `[]` on 404, (3) sends custom UA, (4) sequential not parallel |
| `integration/googleSearch/googleSearch.test.ts` (extend) | (1) `googleSearchDateRange` builds correct `tbs` param, (2) returns `DatedSearchResult[]` from `organic_results` |
| `controllers/morningBrief.controller.test.ts` (extend) | (1) `gapDays=0` emits no catchup events, (2) `gapDays=30` emits catchup alongside three sections, (3) `setLastSeen` + `saveSnapshot` called once at end, (4) abort mid-catchup → no `setLastSeen` write |
| `pages/MorningBrief/components/CatchupSection.test.tsx` (client) | (1) renders gap header from props, (2) accumulates streaming deltas keyed by arcId, (3) renders nothing when arcs empty |

## Verification

```bash
# Server
cd apps/server
npm run typecheck
npm test

# Client
cd ../client
npm run type-check
npm run test:unit
npm run lint
```

End-to-end manual check:
1. Delete `data/` if present. Start dev: `cd apps/server && npm run dev` and `cd apps/client && npm run dev`.
2. First load (`http://localhost:3000/morning-brief` → "Get My Brief"): no catchup section renders; existing three sections work as before. After stream, verify `data/state.json` and `data/briefs/{today}.json` exist.
3. Edit `data/state.json` to set `lastBriefAt` to 30 days ago; refresh and click again. Catchup section renders above the rest with a "Since … — 30 days" header and 3–5 arcs. Each arc summary streams in.
4. Mid-stream, close the tab. Verify `data/state.json` is **unchanged** (gap preserved).
5. Set `LOG_LEVEL=debug` and try `?simulateLastSeen=2026-04-07` to test specific gap windows without manually editing state.
6. Unset `SERP_SEARCH_API_KEY`: catchup should still attempt Wikipedia + snapshots and emit `catchup_error` only if all three sources fail.
