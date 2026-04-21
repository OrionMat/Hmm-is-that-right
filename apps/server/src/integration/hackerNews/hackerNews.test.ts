import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../logger.ts");

const { mockAxiosGet } = vi.hoisted(() => {
  const mockAxiosGet = vi.fn();
  return { mockAxiosGet };
});

vi.mock("axios", () => ({
  default: { get: mockAxiosGet },
}));

import { getTopStories } from "./hackerNews";

const STORY = {
  id: 1,
  type: "story",
  title: "Interesting Article",
  url: "https://example.com/article",
  score: 200,
  by: "user123",
  descendants: 40,
  time: 1700000000,
};

beforeEach(() => vi.clearAllMocks());

describe("getTopStories", () => {
  it("returns hydrated stories", async () => {
    mockAxiosGet
      .mockResolvedValueOnce({ data: [1, 2] }) // topstories.json
      .mockResolvedValueOnce({ data: STORY })   // item/1
      .mockResolvedValueOnce({ data: { ...STORY, id: 2, title: "Another Article" } }); // item/2

    const stories = await getTopStories(2);
    expect(stories).toHaveLength(2);
    expect(stories[0].title).toBe("Interesting Article");
  });

  it("filters out stories below minScore", async () => {
    mockAxiosGet
      .mockResolvedValueOnce({ data: [1] })
      .mockResolvedValueOnce({ data: { ...STORY, score: 10 } });

    const stories = await getTopStories(1, 100);
    expect(stories).toHaveLength(0);
  });

  it("skips non-story items", async () => {
    mockAxiosGet
      .mockResolvedValueOnce({ data: [1] })
      .mockResolvedValueOnce({ data: { id: 1, type: "comment", title: null } });

    const stories = await getTopStories(1);
    expect(stories).toHaveLength(0);
  });

  it("handles item fetch failures gracefully", async () => {
    mockAxiosGet
      .mockResolvedValueOnce({ data: [1, 2] })
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce({ data: STORY });

    const stories = await getTopStories(2);
    expect(stories).toHaveLength(1);
  });
});
