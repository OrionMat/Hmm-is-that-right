import axios from "axios";
import { getLogger } from "../../logger";
import { serverConfig } from "../../config/serverConfig";

const log = getLogger("integration/reddit");

const FETCH_TIMEOUT_MS = 10000;

export interface RedditPost {
  id: string;
  title: string;
  url: string;
  selftext: string;
  score: number;
  num_comments: number;
  subreddit: string;
  permalink: string;
}

/**
 * Fetches top posts from a subreddit using the public JSON API (no auth required).
 * MUST send a User-Agent header — Reddit returns 429 without one.
 */
export async function getSubredditTop(
  subreddit: string,
  window: "day" | "week" | "month" = "day",
  limit = 10,
): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}/top.json?t=${window}&limit=${limit}`;
  log.debug({ subreddit, window, limit }, "Fetching Reddit top posts");

  try {
    const { data } = await axios.get(url, {
      timeout: FETCH_TIMEOUT_MS,
      headers: { "User-Agent": serverConfig.redditUserAgent },
    });

    const posts: RedditPost[] = (data?.data?.children ?? [])
      .map((child: { data: Record<string, unknown> }) => child.data)
      .filter((p: Record<string, unknown>) => p.title && !p.stickied)
      .map((p: Record<string, unknown>) => ({
        id: String(p.id ?? ""),
        title: String(p.title ?? ""),
        url: String(p.url ?? `https://www.reddit.com${p.permalink}`),
        selftext: String(p.selftext ?? ""),
        score: Number(p.score ?? 0),
        num_comments: Number(p.num_comments ?? 0),
        subreddit: String(p.subreddit ?? subreddit),
        permalink: `https://www.reddit.com${p.permalink ?? ""}`,
      }));

    log.info({ subreddit, returned: posts.length }, "Reddit posts fetched");
    return posts;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.warn({ subreddit, message }, "Failed to fetch Reddit posts, returning empty");
    return [];
  }
}
