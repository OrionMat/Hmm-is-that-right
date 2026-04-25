import { fetchRssFeeds } from "../../integration/fetchRssFeed/fetchRssFeed";
import { getTopStories } from "../../integration/hackerNews/hackerNews";
import { getSubredditTop } from "../../integration/reddit/reddit";
import { listEssays } from "../../integration/paulGraham/paulGraham";
import { LongformMode } from "../../dataModel/dataModel";
import { SectionCandidate, SectionSpec } from "./buildSection";

function makeId(index: number): string {
  return `c${index}`;
}

function toCandidate(
  index: number,
  title: string,
  source: string,
  url: string,
  extra?: Pick<SectionCandidate, "score" | "snippet" | "content">,
): SectionCandidate {
  return { id: makeId(index), title, source, url, ...extra };
}

export function worldSpec(): SectionSpec {
  return {
    section: "world",
    displayName: "World Headlines",
    n: 2,
    async fetchCandidates() {
      const feeds = await fetchRssFeeds(["bbc", "ap", "reuters"]);
      const candidates: SectionCandidate[] = [];
      let i = 0;
      for (const [source, articles] of Object.entries(feeds)) {
        for (const a of articles) {
          candidates.push(toCandidate(i++, a.title, source, a.url, { snippet: a.description ?? undefined }));
        }
      }
      return candidates;
    },
  };
}

export function techSpec(): SectionSpec {
  return {
    section: "tech",
    displayName: "Tech & AI Stories",
    n: 2,
    async fetchCandidates() {
      const [hnStories, feeds] = await Promise.all([
        getTopStories(30, 50),
        fetchRssFeeds(["theBatch", "anthropicBlog", "githubBlog"]),
      ]);
      const candidates: SectionCandidate[] = [];
      let i = 0;
      for (const story of hnStories.slice(0, 15)) {
        candidates.push(toCandidate(i++, story.title, "hackernews", story.url, { score: story.score }));
      }
      for (const [source, articles] of Object.entries(feeds)) {
        for (const a of articles) {
          candidates.push(toCandidate(i++, a.title, source, a.url, { snippet: a.description ?? undefined }));
        }
      }
      return candidates;
    },
  };
}

export function longformSpec(mode: LongformMode): SectionSpec {
  return {
    section: "longform",
    mode,
    displayName: "Long-Form Insight",
    n: 1,
    async fetchCandidates() {
      const candidates: SectionCandidate[] = [];
      let i = 0;

      if (mode === "zoom-in") {
        const [hnStories, feeds] = await Promise.all([
          getTopStories(30, 100),
          fetchRssFeeds(["anthropicBlog", "githubBlog"]),
        ]);
        for (const s of hnStories.slice(0, 10)) {
          candidates.push(toCandidate(i++, s.title, "hackernews", s.url, { score: s.score }));
        }
        for (const [source, articles] of Object.entries(feeds)) {
          for (const a of articles.slice(0, 3)) {
            candidates.push(toCandidate(i++, a.title, source, a.url, { snippet: a.description ?? undefined }));
          }
        }
      } else if (mode === "zoom-out") {
        const [essays, hnStories, feeds] = await Promise.all([
          listEssays(),
          getTopStories(30, 50),
          fetchRssFeeds(["theBatch"]),
        ]);
        // 5 random PG essays
        const shuffled = [...essays].sort(() => Math.random() - 0.5).slice(0, 5);
        for (const e of shuffled) {
          candidates.push(toCandidate(i++, e.title, "paulgraham", e.url));
        }
        // HN stories with high discussion (zoom-out pieces generate debate)
        for (const s of hnStories.filter((s) => s.descendants > 50).slice(0, 5)) {
          candidates.push(toCandidate(i++, s.title, "hackernews", s.url, { score: s.score }));
        }
        for (const [source, articles] of Object.entries(feeds)) {
          for (const a of articles.slice(0, 3)) {
            candidates.push(toCandidate(i++, a.title, source, a.url, { snippet: a.description ?? undefined }));
          }
        }
      } else {
        // inversion — contrarian threads and high-discussion posts
        const [hnStories, redditResults] = await Promise.all([
          getTopStories(30, 50),
          Promise.all([
            getSubredditTop("ExperiencedDevs", "week", 5),
            getSubredditTop("MachineLearning", "week", 5),
            getSubredditTop("cscareerquestions", "week", 5),
          ]),
        ]);
        for (const s of hnStories.filter((s) => s.descendants > 50).slice(0, 8)) {
          candidates.push(toCandidate(i++, s.title, "hackernews", s.url, { score: s.score }));
        }
        for (const posts of redditResults) {
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
      }

      return candidates;
    },
  };
}
