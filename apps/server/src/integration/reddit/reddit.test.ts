import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../logger.ts");

const { mockAxiosGet, mockServerConfig } = vi.hoisted(() => {
  const mockAxiosGet = vi.fn();
  const mockServerConfig = { redditUserAgent: "TestAgent/1.0" };
  return { mockAxiosGet, mockServerConfig };
});

vi.mock("axios", () => ({
  default: { get: mockAxiosGet },
}));

vi.mock("../../config/serverConfig", () => ({ serverConfig: mockServerConfig }));

import { getSubredditTop } from "./reddit";

const MOCK_POST = {
  id: "abc123",
  title: "Interesting discussion",
  url: "https://www.reddit.com/r/ExperiencedDevs/comments/abc123/interesting_discussion/",
  selftext: "This is the body of the post.",
  score: 150,
  num_comments: 42,
  subreddit: "ExperiencedDevs",
  permalink: "/r/ExperiencedDevs/comments/abc123/interesting_discussion/",
  stickied: false,
};

beforeEach(() => vi.clearAllMocks());

describe("getSubredditTop", () => {
  it("returns parsed posts", async () => {
    mockAxiosGet.mockResolvedValue({
      data: { data: { children: [{ data: MOCK_POST }] } },
    });

    const posts = await getSubredditTop("ExperiencedDevs");
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe("Interesting discussion");
    expect(posts[0].score).toBe(150);
  });

  it("sends the configured User-Agent header", async () => {
    mockAxiosGet.mockResolvedValue({ data: { data: { children: [] } } });

    await getSubredditTop("ExperiencedDevs");

    expect(mockAxiosGet).toHaveBeenCalledWith(
      expect.stringContaining("ExperiencedDevs"),
      expect.objectContaining({ headers: { "User-Agent": "TestAgent/1.0" } }),
    );
  });

  it("filters stickied posts", async () => {
    mockAxiosGet.mockResolvedValue({
      data: { data: { children: [{ data: { ...MOCK_POST, stickied: true } }] } },
    });

    const posts = await getSubredditTop("ExperiencedDevs");
    expect(posts).toHaveLength(0);
  });

  it("returns empty array on fetch error", async () => {
    mockAxiosGet.mockRejectedValue(new Error("network error"));

    const posts = await getSubredditTop("ExperiencedDevs");
    expect(posts).toEqual([]);
  });
});
