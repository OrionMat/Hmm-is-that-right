import axios from "axios";
import { vi } from "vitest";
import { googleSearch, toSourceUrls } from "./googleSearch";

vi.mock("axios");
vi.mock("../../logger.ts");
vi.mock("../../config/serverConfig", () => ({
  serverConfig: { serpSearchApiKey: "NOT_TELLING" },
}));

const mockAxios = vi.mocked(axios, true);

const statement = "Kenya win 7s";
const sources = ["fancy source", "shmancy source", "pure shmorce", "horse"];

beforeEach(() => {
  mockAxios.get.mockReset();
});

describe("googleSearch", () => {
  test("Ideal case: builds per-source SerpAPI requests and returns url+title+snippet results", async () => {
    const fancyResponse = {
      data: {
        organic_results: [
          { link: "www.fancy.com/article-1", title: "Fancy 1", snippet: "snip 1" },
          { link: "www.fancy.com/article-2", title: "Fancy 2" },
        ],
      },
    };
    const shmorceResponse = {
      data: {
        organic_results: [
          { link: "www.shmorce.com/article-1", title: "Shmorce 1" },
          { link: "www.shmorce.com/article-2", title: "Shmorce 2" },
        ],
      },
    };

    mockAxios.get.mockResolvedValueOnce(fancyResponse);
    mockAxios.get.mockRejectedValueOnce(new Error("boom"));
    mockAxios.get.mockResolvedValueOnce(shmorceResponse);
    mockAxios.get.mockRejectedValueOnce(new Error("boom2"));

    const results = await googleSearch(statement, sources);

    expect(mockAxios.get.mock.calls[0][0]).toBe("https://serpapi.com/search");
    expect(mockAxios.get.mock.calls[0][1]).toEqual({
      params: {
        api_key: "NOT_TELLING",
        q: "fancy source + Kenya win 7s",
        engine: "google",
        num: 10,
        gl: "us",
        hl: "en",
      },
    });
    expect(mockAxios.get.mock.calls[1][1]).toMatchObject({
      params: { q: "shmancy source + Kenya win 7s" },
    });

    expect(results["fancy source"]).toEqual([
      { url: "www.fancy.com/article-1", title: "Fancy 1", snippet: "snip 1" },
      { url: "www.fancy.com/article-2", title: "Fancy 2", snippet: undefined },
    ]);
    // Rejected promises map to an empty array for that source
    expect(results["shmancy source"]).toEqual([]);
    expect(results["pure shmorce"]).toHaveLength(2);
    expect(results["horse"]).toEqual([]);
  });

  test("Non-ideal case: malformed response keeps that source empty without throwing", async () => {
    mockAxios.get.mockResolvedValueOnce({}); // missing .data
    mockAxios.get.mockResolvedValueOnce({ data: {} }); // missing organic_results
    mockAxios.get.mockResolvedValueOnce({ data: { organic_results: [{ snippet: "no link" }] } });
    mockAxios.get.mockResolvedValueOnce({ data: { organic_results: [] } });

    const results = await googleSearch(statement, sources);

    expect(results["fancy source"]).toEqual([]);
    expect(results["shmancy source"]).toEqual([]);
    expect(results["pure shmorce"]).toEqual([]); // dropped: no .link
    expect(results["horse"]).toEqual([]);
  });

  test("Non-ideal case: outer error path wraps and rethrows", async () => {
    mockAxios.get.mockImplementationOnce(() => {
      throw { status: 500 };
    });

    let caught: unknown;
    try {
      await googleSearch(statement, sources.slice(0, 1));
    } catch (err) {
      caught = err;
    }

    expect(caught).toEqual(new Error("Searching Google: [object Object]"));
  });

  test("toSourceUrls collapses rich results down to a plain SourceUrls map", () => {
    const collapsed = toSourceUrls({
      bbc: [
        { url: "https://bbc.co.uk/1", title: "A" },
        { url: "https://bbc.co.uk/2", title: "B", snippet: "x" },
      ],
      nyt: [],
    });
    expect(collapsed).toEqual({
      bbc: ["https://bbc.co.uk/1", "https://bbc.co.uk/2"],
      nyt: [],
    });
  });
});
