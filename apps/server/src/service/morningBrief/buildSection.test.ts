import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../logger.ts");

const { mockLlmComplete, mockLlmCompleteStream, mockScrapePageHtml, mockParseHtmlWithMetrics } =
  vi.hoisted(() => {
    return {
      mockLlmComplete: vi.fn(),
      mockLlmCompleteStream: vi.fn(),
      mockScrapePageHtml: vi.fn(),
      mockParseHtmlWithMetrics: vi.fn(),
    };
  });

// Helper to wrap a string (or chunks) as an AsyncGenerator that completeStream yields.
function streamOf(...chunks: string[]): AsyncGenerator<string> {
  return (async function* () {
    for (const c of chunks) yield c;
  })();
}

vi.mock("../../integration/llmService/llmService", () => ({
  llmService: {
    complete: mockLlmComplete,
    completeStream: mockLlmCompleteStream,
  },
}));
vi.mock("../../integration/scrapePageHtml/scrapePageHtml", () => ({
  scrapePageHtml: mockScrapePageHtml,
}));
vi.mock("../parseHtml/parseHtml", () => ({
  parseHtmlWithMetrics: mockParseHtmlWithMetrics,
}));

import { buildSection, FetchCandidatesResult, SectionCandidate, SectionSpec } from "./buildSection";

const CANDIDATES: SectionCandidate[] = [
  { id: "c1", title: "Story One", source: "bbc", url: "https://bbc.co.uk/1", score: 100 },
  { id: "c2", title: "Story Two", source: "ap", url: "https://apnews.com/2", score: 50 },
  { id: "c3", title: "Story Three", source: "reuters", url: "https://reuters.com/3", score: 200 },
];

function fcResult(candidates: SectionCandidate[]): FetchCandidatesResult {
  return { candidates, sources: [] };
}

function makeSpec(overrides: Partial<SectionSpec> = {}): SectionSpec {
  return {
    section: "world",
    displayName: "World Headlines",
    n: 2,
    fetchCandidates: vi.fn().mockResolvedValue(fcResult(CANDIDATES)),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockScrapePageHtml.mockResolvedValue({});
  mockParseHtmlWithMetrics.mockReturnValue({ newsPieces: [] });
  // Default: every Stage-2 stream yields a single chunk so existing tests just work
  mockLlmCompleteStream.mockImplementation(() => streamOf("Summary."));
});

describe("buildSection", () => {
  it("returns an empty payload when no candidates are found", async () => {
    const spec = makeSpec({ fetchCandidates: vi.fn().mockResolvedValue(fcResult([])) });

    const { payload } = await buildSection(spec, "ctx", "req-1");

    expect(payload.section).toBe("world");
    expect(payload.items).toEqual([]);
  });

  it("runs the two-stage pipeline and returns summaries for picked items", async () => {
    mockLlmComplete.mockResolvedValueOnce('{"picks":["c1"]}'); // stage-1
    mockLlmCompleteStream.mockImplementationOnce(() => streamOf("A great summary."));

    const { payload } = await buildSection(makeSpec(), "ctx", "req-1");

    expect(payload.items).toHaveLength(1);
    expect(payload.items[0]).toMatchObject({
      title: "Story One",
      source: "bbc",
      url: "https://bbc.co.uk/1",
      summary: "A great summary.",
    });
    expect(payload.section).toBe("world");
    expect(payload.generatedAt).toBeTruthy();
  });

  it("invokes streaming callbacks: onSectionReady (skeleton), onSummaryChunk, onSummaryDone", async () => {
    mockLlmComplete.mockResolvedValueOnce('{"picks":["c1"]}');
    mockLlmCompleteStream.mockImplementationOnce(() => streamOf("Hello ", "world."));

    const onSectionReady = vi.fn();
    const onSummaryChunk = vi.fn();
    const onSummaryDone = vi.fn();

    const { payload } = await buildSection(makeSpec({ n: 1 }), "ctx", "req-1", undefined, {
      onSectionReady,
      onSummaryChunk,
      onSummaryDone,
    });

    // Skeleton fires once with empty summary
    expect(onSectionReady).toHaveBeenCalledTimes(1);
    expect(onSectionReady.mock.calls[0][0].items[0]).toMatchObject({
      title: "Story One",
      summary: "",
    });

    // One chunk per delta, accumulating to the final summary
    expect(onSummaryChunk).toHaveBeenCalledTimes(2);
    expect(onSummaryChunk).toHaveBeenNthCalledWith(1, "https://bbc.co.uk/1", "Hello ");
    expect(onSummaryChunk).toHaveBeenNthCalledWith(2, "https://bbc.co.uk/1", "world.");

    // onSummaryDone fires once per item, after the stream
    expect(onSummaryDone).toHaveBeenCalledWith("https://bbc.co.uk/1");

    // Final return value still has the full accumulated summary
    expect(payload.items[0].summary).toBe("Hello world.");
  });

  it("falls back to top-by-score when stage-1 returns invalid JSON", async () => {
    // Both stage-1 attempts return non-JSON. Stage-2 uses the default streaming mock.
    mockLlmComplete
      .mockResolvedValueOnce("Sorry, I cannot help with that.")
      .mockResolvedValueOnce("Still not JSON.");

    const { payload } = await buildSection(makeSpec({ n: 2 }), "ctx", "req-1");

    // Should fall back to top 2 by score: c3 (200) and c1 (100)
    const titles = payload.items.map((i) => i.title);
    expect(titles).toContain("Story Three");
    expect(titles).toContain("Story One");
    expect(titles).not.toContain("Story Two");
  });

  it("falls back to top-by-score when stage-1 LLM throws", async () => {
    mockLlmComplete.mockRejectedValueOnce(new Error("LLM unavailable")); // stage-1 throws

    const { payload } = await buildSection(makeSpec({ n: 1 }), "ctx", "req-1");

    // Top by score is c3 (200)
    expect(payload.items[0].title).toBe("Story Three");
  });

  it("uses pre-fetched content and skips scraping for candidates that have it", async () => {
    const specWithContent = makeSpec({
      fetchCandidates: vi.fn().mockResolvedValue(
        fcResult([{ ...CANDIDATES[0], content: "Pre-fetched article text." }]),
      ),
      n: 1,
    });
    mockLlmComplete.mockResolvedValueOnce('{"picks":["c1"]}'); // stage-1

    await buildSection(specWithContent, "ctx", "req-1");

    expect(mockScrapePageHtml).not.toHaveBeenCalled();
  });

  it("throws immediately when the abort signal is already set", async () => {
    const ac = new AbortController();
    ac.abort();

    await expect(buildSection(makeSpec(), "ctx", "req-1", ac.signal)).rejects.toThrow(
      "Request aborted",
    );
  });

  it("returns diagnostics with sources, candidates marked picked, and scrape outcomes", async () => {
    mockLlmComplete.mockResolvedValueOnce('{"picks":["c1"]}'); // stage-1 picks Story One
    mockLlmCompleteStream.mockImplementationOnce(() => streamOf("Summary."));

    // Simulate scraping returning content for the picked URL
    mockScrapePageHtml.mockResolvedValueOnce({});
    mockParseHtmlWithMetrics.mockReturnValueOnce({
      newsPieces: [
        {
          url: "https://bbc.co.uk/1",
          title: "Story One",
          date: null,
          body: ["Article body text."],
          source: "bbc",
        },
      ],
    });

    const sources = [
      { source: "bbc", kind: "rss" as const, status: "ok" as const, articlesReturned: 3 },
      { source: "ap", kind: "rss" as const, status: "failed" as const, articlesReturned: 0, error: "timeout" },
    ];
    const spec = makeSpec({
      n: 1,
      fetchCandidates: vi.fn().mockResolvedValue({ candidates: CANDIDATES, sources }),
    });

    const { diagnostics: d } = await buildSection(spec, "ctx", "req-1");

    expect(d.section).toBe("world");
    expect(d.cacheHit).toBe(false);
    expect(d.llmModel).toBe("claude-sonnet-4-6");
    expect(d.selectionMethod).toBe("llm");
    expect(d.personalContextUsed).toBe(true);
    expect(d.sources).toEqual(sources);
    expect(d.candidates).toHaveLength(3);
    const picked = d.candidates.filter((c) => c.picked);
    expect(picked).toHaveLength(1);
    expect(picked[0]).toMatchObject({ id: "c1", title: "Story One", picked: true });
    expect(d.scrapes).toHaveLength(1);
    expect(d.scrapes[0]).toMatchObject({ url: "https://bbc.co.uk/1", outcome: "scraped" });
    expect(d.durations.totalMs).toBeGreaterThanOrEqual(0);
  });

  it("returns diagnostics with selectionMethod=score-fallback when stage-1 LLM fails", async () => {
    mockLlmComplete.mockRejectedValueOnce(new Error("LLM down"));

    const { diagnostics } = await buildSection(makeSpec({ n: 1 }), "ctx", "req-1");

    expect(diagnostics.selectionMethod).toBe("score-fallback");
  });

  it("returns diagnostics with selectionMethod=none when there are no candidates", async () => {
    const spec = makeSpec({ fetchCandidates: vi.fn().mockResolvedValue(fcResult([])) });

    const { diagnostics: d } = await buildSection(spec, "ctx", "req-1");

    expect(d.selectionMethod).toBe("none");
    expect(d.candidates).toEqual([]);
    expect(d.scrapes).toEqual([]);
  });

  it("flags scrape outcome=prefetched for candidates with pre-fetched content", async () => {
    mockLlmComplete.mockResolvedValueOnce('{"picks":["c1"]}');
    const spec = makeSpec({
      n: 1,
      fetchCandidates: vi.fn().mockResolvedValue(
        fcResult([{ ...CANDIDATES[0], content: "Pre-fetched body." }]),
      ),
    });

    const { diagnostics } = await buildSection(spec, "ctx", "req-1");

    expect(diagnostics.scrapes[0].outcome).toBe("prefetched");
  });

  it("flags scrape outcome=snippet-fallback when scraping returns no content", async () => {
    mockLlmComplete.mockResolvedValueOnce('{"picks":["c1"]}');
    // Default mocks: scrapePageHtml resolves to {}, parseHtmlWithMetrics returns no pieces
    const { diagnostics } = await buildSection(makeSpec({ n: 1 }), "ctx", "req-1");

    expect(diagnostics.scrapes[0].outcome).toBe("snippet-fallback");
  });

  it("throws after fetchCandidates when the signal is aborted mid-flight", async () => {
    const ac = new AbortController();

    const spec = makeSpec({
      fetchCandidates: vi.fn().mockImplementation(async () => {
        ac.abort(); // abort fires while fetchCandidates is running
        return fcResult(CANDIDATES);
      }),
    });

    await expect(buildSection(spec, "ctx", "req-1", ac.signal)).rejects.toThrow(
      "Request aborted",
    );

    // Stage-1 LLM should never have been called
    expect(mockLlmComplete).not.toHaveBeenCalled();
  });
});
