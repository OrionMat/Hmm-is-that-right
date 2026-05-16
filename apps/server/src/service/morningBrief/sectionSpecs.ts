import { fetchRssFeedsWithStatus, RssFeedResult } from "../../integration/fetchRssFeed/fetchRssFeed";
import { getTopStories, HnStory } from "../../integration/hackerNews/hackerNews";
import { getSubredditTop, RedditPost } from "../../integration/reddit/reddit";
import { listEssays, PgEssay } from "../../integration/paulGraham/paulGraham";
import {
  LongformMode,
  SourceQueryResult,
  SOURCE_KIND,
  SOURCE_STATUS,
} from "../../dataModel/dataModel";
import { getLogger } from "../../logger";
import { FetchCandidatesResult, SectionCandidate, SectionSpec } from "./buildSection";

const log = getLogger("service/morningBrief/sectionSpecs");

function makeId(index: number): string {
  return `c${index}`;
}

// RSS feeds (especially Google News fallbacks) often append the source name
// as a suffix to every title — "Trump signs bill - Reuters", "AI breakthrough |
// The Verge". When the snippet is also just the title, this becomes paraphrase
// spam in summaries. Strip a trailing " - <source>" (or em/en dash, or pipe).
const TITLE_SUFFIX_PATTERN = /\s+[-–—|]\s+[\w][\w &'.,]*$/;

function cleanTitle(raw: string): string {
  const trimmed = raw.trim();
  const stripped = trimmed.replace(TITLE_SUFFIX_PATTERN, "").trim();
  // Don't strip if it would leave the title oddly short (e.g. "Trump - News")
  return stripped.length >= 8 ? stripped : trimmed;
}

function toCandidate(
  index: number,
  title: string,
  source: string,
  url: string,
  extra?: Pick<SectionCandidate, "score" | "snippet" | "content">,
): SectionCandidate {
  return { id: makeId(index), title: cleanTitle(title), source, url, ...extra };
}

function statusFor(count: number): SourceQueryResult["status"] {
  return count === 0 ? SOURCE_STATUS.empty : SOURCE_STATUS.ok;
}

async function fetchHnStories(
  limit: number,
  minScore: number,
): Promise<{ stories: HnStory[]; result: SourceQueryResult }> {
  try {
    const stories = await getTopStories(limit, minScore);
    return {
      stories,
      result: {
        source: "hackernews",
        kind: SOURCE_KIND.hackernews,
        status: statusFor(stories.length),
        articlesReturned: stories.length,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.warn({ message }, "Hacker News fetch failed");
    return {
      stories: [],
      result: {
        source: "hackernews",
        kind: SOURCE_KIND.hackernews,
        status: SOURCE_STATUS.failed,
        articlesReturned: 0,
        error: message,
      },
    };
  }
}

async function fetchSubreddit(
  subreddit: string,
  window: "day" | "week" | "month",
  limit: number,
): Promise<{ posts: RedditPost[]; result: SourceQueryResult }> {
  const posts = await getSubredditTop(subreddit, window, limit);
  return {
    posts,
    result: {
      source: `r/${subreddit}`,
      kind: SOURCE_KIND.reddit,
      status: statusFor(posts.length),
      articlesReturned: posts.length,
    },
  };
}

async function fetchPgEssays(): Promise<{ essays: PgEssay[]; result: SourceQueryResult }> {
  const essays = await listEssays();
  return {
    essays,
    result: {
      source: "paulgraham",
      kind: SOURCE_KIND.paulgraham,
      status: statusFor(essays.length),
      articlesReturned: essays.length,
    },
  };
}

function rssToSourceResults(results: RssFeedResult[]): SourceQueryResult[] {
  return results.map((r) => ({
    source: r.source,
    kind: SOURCE_KIND.rss,
    status: r.status,
    articlesReturned: r.articles.length,
    error: r.error,
  }));
}

const WORLD_DEFAULT_SOURCES = ["bbc", "ap", "reuters"] as const;

export function worldSpec(enabledToggleSources?: string[]): SectionSpec {
  // When tile toggles are provided, intersect with world's default set. "reuters"
  // isn't a toggle-able source today, so it always stays unless we explicitly
  // strip it. Toggles only meaningfully gate BBC/AP here.
  const sources = enabledToggleSources
    ? WORLD_DEFAULT_SOURCES.filter(
        (s) => enabledToggleSources.includes(s) || !(["bbc", "ap"] as readonly string[]).includes(s),
      )
    : [...WORLD_DEFAULT_SOURCES];
  return {
    section: "world",
    displayName: "World Headlines",
    n: 2,
    async fetchCandidates(): Promise<FetchCandidatesResult> {
      if (sources.length === 0) {
        return { candidates: [], sources: [] };
      }
      const feeds = await fetchRssFeedsWithStatus(sources);
      const candidates: SectionCandidate[] = [];
      let i = 0;
      for (const feed of feeds) {
        for (const a of feed.articles) {
          candidates.push(toCandidate(i++, a.title, feed.source, a.url, { snippet: a.description ?? undefined }));
        }
      }
      return { candidates, sources: rssToSourceResults(feeds) };
    },
  };
}

export function techSpec(): SectionSpec {
  return {
    section: "tech",
    displayName: "Tech & AI Stories",
    n: 2,
    async fetchCandidates(): Promise<FetchCandidatesResult> {
      const [hnFetch, feeds] = await Promise.all([
        fetchHnStories(30, 50),
        fetchRssFeedsWithStatus(["theBatch", "anthropicBlog", "githubBlog"]),
      ]);
      const candidates: SectionCandidate[] = [];
      let i = 0;
      for (const story of hnFetch.stories.slice(0, 15)) {
        candidates.push(toCandidate(i++, story.title, "hackernews", story.url, { score: story.score }));
      }
      for (const feed of feeds) {
        for (const a of feed.articles) {
          candidates.push(toCandidate(i++, a.title, feed.source, a.url, { snippet: a.description ?? undefined }));
        }
      }
      return {
        candidates,
        sources: [hnFetch.result, ...rssToSourceResults(feeds)],
      };
    },
  };
}

export function longformSpec(mode: LongformMode): SectionSpec {
  return {
    section: "longform",
    mode,
    displayName: "Long-Form Insight",
    n: 1,
    async fetchCandidates(): Promise<FetchCandidatesResult> {
      const candidates: SectionCandidate[] = [];
      let i = 0;
      const sources: SourceQueryResult[] = [];

      if (mode === "zoom-in") {
        const [hnFetch, feeds] = await Promise.all([
          fetchHnStories(30, 100),
          fetchRssFeedsWithStatus(["anthropicBlog", "githubBlog"]),
        ]);
        for (const s of hnFetch.stories.slice(0, 10)) {
          candidates.push(toCandidate(i++, s.title, "hackernews", s.url, { score: s.score }));
        }
        for (const feed of feeds) {
          for (const a of feed.articles.slice(0, 3)) {
            candidates.push(toCandidate(i++, a.title, feed.source, a.url, { snippet: a.description ?? undefined }));
          }
        }
        sources.push(hnFetch.result, ...rssToSourceResults(feeds));
      } else if (mode === "zoom-out") {
        const [pgFetch, hnFetch, feeds] = await Promise.all([
          fetchPgEssays(),
          fetchHnStories(30, 50),
          fetchRssFeedsWithStatus(["theBatch"]),
        ]);
        // 5 random PG essays
        const shuffled = [...pgFetch.essays].sort(() => Math.random() - 0.5).slice(0, 5);
        for (const e of shuffled) {
          candidates.push(toCandidate(i++, e.title, "paulgraham", e.url));
        }
        // HN stories with high discussion (zoom-out pieces generate debate)
        for (const s of hnFetch.stories.filter((s) => s.descendants > 50).slice(0, 5)) {
          candidates.push(toCandidate(i++, s.title, "hackernews", s.url, { score: s.score }));
        }
        for (const feed of feeds) {
          for (const a of feed.articles.slice(0, 3)) {
            candidates.push(toCandidate(i++, a.title, feed.source, a.url, { snippet: a.description ?? undefined }));
          }
        }
        sources.push(pgFetch.result, hnFetch.result, ...rssToSourceResults(feeds));
      } else {
        // inversion — contrarian threads and high-discussion posts
        const [hnFetch, redditResults] = await Promise.all([
          fetchHnStories(30, 50),
          Promise.all([
            fetchSubreddit("ExperiencedDevs", "week", 5),
            fetchSubreddit("MachineLearning", "week", 5),
            fetchSubreddit("cscareerquestions", "week", 5),
          ]),
        ]);
        for (const s of hnFetch.stories.filter((s) => s.descendants > 50).slice(0, 8)) {
          candidates.push(toCandidate(i++, s.title, "hackernews", s.url, { score: s.score }));
        }
        for (const { posts } of redditResults) {
          for (const post of posts) {
            candidates.push(
              toCandidate(i++, post.title, `r/${post.subreddit}`, post.permalink, {
                score: post.score,
                // Include selftext so we can skip scraping for self-posts
                content: post.selftext || undefined,
                snippet: post.selftext.slice(0, 200) || undefined,
              }),
            );
          }
        }
        sources.push(hnFetch.result, ...redditResults.map((r) => r.result));
      }

      return { candidates, sources };
    },
  };
}
