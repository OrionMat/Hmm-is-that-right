import { describe, it, expect, vi, beforeEach } from "vitest";
import { summarizeArticles } from "./summarizeArticles";
import { llmService } from "../../integration/llmService/llmService";
import { NewsPiece } from "../../dataModel/dataModel";

vi.mock("../../logger.ts");
vi.mock("../../integration/llmService/llmService", () => ({
  llmService: { complete: vi.fn() },
}));

const mockComplete = vi.mocked(llmService.complete);

const makeArticle = (overrides: Partial<NewsPiece> = {}): NewsPiece => ({
  url: "https://example.com/article-1",
  title: "Test Article",
  date: "2026-01-01",
  body: ["First paragraph.", "Second paragraph."],
  source: "bbc",
  ...overrides,
});

const validLlmResponse = (url = "https://example.com/article-1") =>
  JSON.stringify([{ url, title: "Test Article", summary: ["Point one", "Point two"] }]);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("summarizeArticles", () => {
  it("returns HeadlineSummary[] with summaries on a valid LLM response", async () => {
    mockComplete.mockResolvedValue(validLlmResponse());

    const result = await summarizeArticles("bbc", [makeArticle()], "gemini-2.0-flash-lite");

    expect(result).toHaveLength(1);
    expect(result[0].summary).toEqual(["Point one", "Point two"]);
    expect(result[0].source).toBe("bbc");
    expect(result[0].url).toBe("https://example.com/article-1");
  });

  it("returns articles with empty summary when LLM call throws", async () => {
    mockComplete.mockRejectedValue(new Error("LLM unavailable"));

    const result = await summarizeArticles("bbc", [makeArticle()], "gemini-2.0-flash-lite");

    expect(result).toHaveLength(1);
    expect(result[0].summary).toEqual([]);
  });

  it("returns articles with empty summary when LLM returns malformed JSON", async () => {
    mockComplete.mockResolvedValue("not valid json at all");

    const result = await summarizeArticles("bbc", [makeArticle()], "gemini-2.0-flash-lite");

    expect(result).toHaveLength(1);
    expect(result[0].summary).toEqual([]);
  });

  it("strips markdown code fences before parsing", async () => {
    const fencedResponse = "```json\n" + validLlmResponse() + "\n```";
    mockComplete.mockResolvedValue(fencedResponse);

    const result = await summarizeArticles("bbc", [makeArticle()], "gemini-2.0-flash-lite");

    expect(result[0].summary).toEqual(["Point one", "Point two"]);
  });

  it("uses empty summary for articles the LLM omits from its response", async () => {
    const articles = [
      makeArticle({ url: "https://example.com/article-1" }),
      makeArticle({ url: "https://example.com/article-2" }),
    ];
    // LLM only returns a summary for article-1
    mockComplete.mockResolvedValue(validLlmResponse("https://example.com/article-1"));

    const result = await summarizeArticles("bbc", articles, "gemini-2.0-flash-lite");

    expect(result).toHaveLength(2);
    expect(result.find((r) => r.url === "https://example.com/article-1")?.summary).toEqual([
      "Point one",
      "Point two",
    ]);
    expect(result.find((r) => r.url === "https://example.com/article-2")?.summary).toEqual([]);
  });

  it("returns an empty array immediately when given no articles", async () => {
    const result = await summarizeArticles("bbc", [], "gemini-2.0-flash-lite");

    expect(result).toEqual([]);
    expect(mockComplete).not.toHaveBeenCalled();
  });
});
