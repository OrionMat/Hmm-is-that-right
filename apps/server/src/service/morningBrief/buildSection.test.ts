import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../logger.ts");

const { mockLlmComplete, mockScrapePageHtml, mockParseHtmlWithMetrics } = vi.hoisted(() => {
  return {
    mockLlmComplete: vi.fn(),
    mockScrapePageHtml: vi.fn(),
    mockParseHtmlWithMetrics: vi.fn(),
  };
});

vi.mock("../../integration/llmService/llmService", () => ({
  llmService: { complete: mockLlmComplete },
}));
vi.mock("../../integration/scrapePageHtml/scrapePageHtml", () => ({
  scrapePageHtml: mockScrapePageHtml,
}));
vi.mock("../parseHtml/parseHtml", () => ({
  parseHtmlWithMetrics: mockParseHtmlWithMetrics,
}));

import { buildSection, SectionCandidate, SectionSpec } from "./buildSection";

const CANDIDATES: SectionCandidate[] = [
  { id: "c1", title: "Story One", source: "bbc", url: "https://bbc.co.uk/1", score: 100 },
  { id: "c2", title: "Story Two", source: "ap", url: "https://apnews.com/2", score: 50 },
  { id: "c3", title: "Story Three", source: "reuters", url: "https://reuters.com/3", score: 200 },
];

function makeSpec(overrides: Partial<SectionSpec> = {}): SectionSpec {
  return {
    section: "world",
    displayName: "World Headlines",
    n: 2,
    fetchCandidates: vi.fn().mockResolvedValue(CANDIDATES),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockScrapePageHtml.mockResolvedValue({});
  mockParseHtmlWithMetrics.mockReturnValue({ newsPieces: [] });
});

describe("buildSection", () => {
  it("returns an empty payload when no candidates are found", async () => {
    const spec = makeSpec({ fetchCandidates: vi.fn().mockResolvedValue([]) });

    const result = await buildSection(spec, "ctx", "req-1");

    expect(result.section).toBe("world");
    expect(result.items).toEqual([]);
  });

  it("runs the two-stage pipeline and returns summaries for picked items", async () => {
    mockLlmComplete
      .mockResolvedValueOnce('{"picks":["c1"]}')   // stage-1
      .mockResolvedValueOnce("A great summary.");   // stage-2

    const result = await buildSection(makeSpec(), "ctx", "req-1");

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      title: "Story One",
      source: "bbc",
      url: "https://bbc.co.uk/1",
      summary: "A great summary.",
    });
    expect(result.section).toBe("world");
    expect(result.generatedAt).toBeTruthy();
  });

  it("falls back to top-by-score when stage-1 returns invalid JSON", async () => {
    // Both stage-1 attempts return non-JSON
    mockLlmComplete
      .mockResolvedValueOnce("Sorry, I cannot help with that.")  // first attempt
      .mockResolvedValueOnce("Still not JSON.")                   // retry
      .mockResolvedValue("Summary.");                              // stage-2 calls

    const result = await buildSection(makeSpec({ n: 2 }), "ctx", "req-1");

    // Should fall back to top 2 by score: c3 (200) and c1 (100)
    const titles = result.items.map((i) => i.title);
    expect(titles).toContain("Story Three");
    expect(titles).toContain("Story One");
    expect(titles).not.toContain("Story Two");
  });

  it("falls back to top-by-score when stage-1 LLM throws", async () => {
    mockLlmComplete
      .mockRejectedValueOnce(new Error("LLM unavailable"))  // stage-1 throws
      .mockResolvedValue("Summary.");                         // stage-2

    const result = await buildSection(makeSpec({ n: 1 }), "ctx", "req-1");

    // Top by score is c3 (200)
    expect(result.items[0].title).toBe("Story Three");
  });

  it("uses pre-fetched content and skips scraping for candidates that have it", async () => {
    const specWithContent = makeSpec({
      fetchCandidates: vi.fn().mockResolvedValue([
        { ...CANDIDATES[0], content: "Pre-fetched article text." },
      ]),
      n: 1,
    });
    mockLlmComplete
      .mockResolvedValueOnce('{"picks":["c1"]}')  // stage-1
      .mockResolvedValueOnce("Summary.");           // stage-2

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

  it("throws after fetchCandidates when the signal is aborted mid-flight", async () => {
    const ac = new AbortController();

    const spec = makeSpec({
      fetchCandidates: vi.fn().mockImplementation(async () => {
        ac.abort(); // abort fires while fetchCandidates is running
        return CANDIDATES;
      }),
    });

    await expect(buildSection(spec, "ctx", "req-1", ac.signal)).rejects.toThrow(
      "Request aborted",
    );

    // Stage-1 LLM should never have been called
    expect(mockLlmComplete).not.toHaveBeenCalled();
  });
});
