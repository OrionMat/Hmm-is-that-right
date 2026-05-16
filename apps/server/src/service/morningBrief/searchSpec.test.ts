import { describe, expect, test, vi, beforeEach } from "vitest";
import { searchSpec } from "./searchSpec";
import { googleSearch } from "../../integration/googleSearch/googleSearch";
import { cleanUrls } from "../cleanUrls/cleanUrls";
import { SOURCE_STATUS } from "../../dataModel/dataModel";
import { ToggleSource } from "../../schemas/morningBrief.schema";

vi.mock("../../logger.ts");
vi.mock("../../integration/googleSearch/googleSearch", async () => {
  const actual = await vi.importActual<
    typeof import("../../integration/googleSearch/googleSearch")
  >("../../integration/googleSearch/googleSearch");
  return {
    ...actual,
    googleSearch: vi.fn(),
  };
});
vi.mock("../cleanUrls/cleanUrls", () => ({
  cleanUrls: vi.fn(),
}));

const mockedGoogleSearch = vi.mocked(googleSearch);
const mockedCleanUrls = vi.mocked(cleanUrls);

describe("searchSpec", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Ideal case: emits candidates per source, sliced to MAX_CANDIDATES_PER_SOURCE", async () => {
    // setup — return 7 results for bbc; should be sliced to 5
    const bbcResults = Array.from({ length: 7 }, (_, i) => ({
      url: `https://www.bbc.co.uk/news/article-${i}`,
      title: `BBC ${i}`,
      snippet: `snip ${i}`,
    }));
    const apResults = [
      { url: "https://apnews.com/x", title: "AP X", snippet: "s" },
    ];
    mockedGoogleSearch.mockResolvedValue({ bbc: bbcResults, ap: apResults });
    mockedCleanUrls.mockReturnValue({
      bbc: bbcResults.map((r) => r.url),
      ap: apResults.map((r) => r.url),
    });

    const sources: ToggleSource[] = ["bbc", "ap"];
    const spec = searchSpec("ai news", sources);

    // run
    const result = await spec.fetchCandidates();

    // asserts
    const bbcKept = result.candidates.filter((c) => c.source === "bbc");
    const apKept = result.candidates.filter((c) => c.source === "ap");
    expect(bbcKept).toHaveLength(5);
    expect(apKept).toHaveLength(1);
    expect(result.sources).toEqual([
      { source: "bbc", kind: "serpapi", status: SOURCE_STATUS.ok, articlesReturned: 5 },
      { source: "ap", kind: "serpapi", status: SOURCE_STATUS.ok, articlesReturned: 1 },
    ]);
  });

  test("Empty sources arg: returns immediately without calling SerpAPI", async () => {
    const spec = searchSpec("ai", []);

    const result = await spec.fetchCandidates();

    expect(mockedGoogleSearch).not.toHaveBeenCalled();
    expect(result).toEqual({ candidates: [], sources: [] });
  });

  test("SerpAPI throws: every source marked failed", async () => {
    mockedGoogleSearch.mockRejectedValue(new Error("network down"));

    const sources: ToggleSource[] = ["bbc", "nyt"];
    const result = await searchSpec("ai", sources).fetchCandidates();

    expect(result.candidates).toEqual([]);
    expect(result.sources).toEqual([
      {
        source: "bbc",
        kind: "serpapi",
        status: SOURCE_STATUS.failed,
        articlesReturned: 0,
        error: "network down",
      },
      {
        source: "nyt",
        kind: "serpapi",
        status: SOURCE_STATUS.failed,
        articlesReturned: 0,
        error: "network down",
      },
    ]);
  });

  test("Source with zero clean URLs: marked empty, others unaffected", async () => {
    mockedGoogleSearch.mockResolvedValue({
      bbc: [{ url: "https://hub.bbc.co.uk/topic/x", title: "junk" }],
      ap: [{ url: "https://apnews.com/x", title: "AP X" }],
    });
    mockedCleanUrls.mockReturnValue({
      bbc: [],
      ap: ["https://apnews.com/x"],
    });

    const sources: ToggleSource[] = ["bbc", "ap"];
    const result = await searchSpec("ai", sources).fetchCandidates();

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].source).toBe("ap");
    expect(result.sources).toEqual([
      { source: "bbc", kind: "serpapi", status: SOURCE_STATUS.empty, articlesReturned: 0 },
      { source: "ap", kind: "serpapi", status: SOURCE_STATUS.ok, articlesReturned: 1 },
    ]);
  });
});
