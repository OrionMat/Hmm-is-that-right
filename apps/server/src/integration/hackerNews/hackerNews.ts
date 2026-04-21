import axios from "axios";
import { getLogger } from "../../logger";

const log = getLogger("integration/hackerNews");

const HN_BASE = "https://hacker-news.firebaseio.com/v0";
const FETCH_TIMEOUT_MS = 10000;

export interface HnStory {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  descendants: number; // comment count
  time: number; // unix timestamp
}

async function fetchItem(id: number): Promise<HnStory | null> {
  try {
    const { data } = await axios.get(`${HN_BASE}/item/${id}.json`, {
      timeout: FETCH_TIMEOUT_MS,
    });
    if (!data || data.type !== "story" || !data.title) return null;
    return {
      id: data.id,
      title: data.title,
      url: data.url ?? `https://news.ycombinator.com/item?id=${data.id}`,
      score: data.score ?? 0,
      by: data.by ?? "",
      descendants: data.descendants ?? 0,
      time: data.time ?? 0,
    };
  } catch {
    return null;
  }
}

/**
 * Fetches top HN stories and returns the ones with URLs.
 * @param limit Number of top story IDs to hydrate (default 30)
 * @param minScore Only include stories with at least this score (default 0)
 */
export async function getTopStories(limit = 30, minScore = 0): Promise<HnStory[]> {
  log.info({ limit, minScore }, "Fetching HN top stories");

  const { data: ids } = await axios.get<number[]>(`${HN_BASE}/topstories.json`, {
    timeout: FETCH_TIMEOUT_MS,
  });

  const topIds = ids.slice(0, limit);
  const results = await Promise.allSettled(topIds.map(fetchItem));

  const stories = results
    .filter((r): r is PromiseFulfilledResult<HnStory> => r.status === "fulfilled" && r.value !== null)
    .map((r) => r.value)
    .filter((s) => s.score >= minScore);

  log.info({ fetched: topIds.length, returned: stories.length }, "HN top stories fetched");
  return stories;
}
