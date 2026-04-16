import { getLogger } from "../logger";
import { fetchRssFeeds } from "../integration/fetchRssFeed/fetchRssFeed";
import { scrapeHomepageUrls } from "../integration/scrapeHomepageUrls/scrapeHomepageUrls";
import { scrapePageHtml } from "../integration/scrapePageHtml/scrapePageHtml";
import { parseHtmlWithMetrics } from "./parseHtml/parseHtml";
import { summarizeArticles } from "./summarizeArticles/summarizeArticles";
import { HeadlineSummary, NewsPiece, RssArticle, SourceUrls } from "../dataModel/dataModel";
import { SupportedModel } from "../integration/llmService/llmService";
import { getSourceConfig } from "../config/sources";

const log = getLogger("service/getHeadlineNews");

/**
 * Fetches current headline news for each selected source, scrapes the full
 * article content, and summarizes each article into bullet points via LLM.
 *
 * Sources with a homepage config (e.g. AP) have their article URLs extracted
 * directly from the homepage. Sources without one use RSS feeds (e.g. BBC, NYT).
 * If article scraping is blocked (e.g. NYT 403), falls back to RSS descriptions.
 *
 * @param sources Array of source keys (e.g. ["bbc", "ap"])
 * @param model The LLM model to use for summarization
 * @param context Optional request context for logging
 */
export async function getHeadlineNews(
  sources: string[],
  model: SupportedModel,
  context?: { requestId?: string }
): Promise<HeadlineSummary[]> {
  log.info({ sources, model }, "Getting headline news");

  // Step 1: Route each source to RSS or homepage scraping based on its config
  const rssSources = sources.filter((s) => !getSourceConfig(s).homepage);
  const homepageSources = sources.filter((s) => !!getSourceConfig(s).homepage);

  const [rssFeedsBySource, homepageUrlsBySource] = await Promise.all([
    rssSources.length > 0
      ? fetchRssFeeds(rssSources)
      : Promise.resolve({} as Record<string, RssArticle[]>),
    homepageSources.length > 0
      ? scrapeHomepageUrls(homepageSources)
      : Promise.resolve({} as Record<string, string[]>),
  ]);

  // Step 2: Build unified SourceUrls map
  const sourceUrls: SourceUrls = {};
  for (const source of rssSources) {
    sourceUrls[source] = (rssFeedsBySource[source] ?? []).map((a) => a.url).filter(Boolean);
  }
  for (const source of homepageSources) {
    sourceUrls[source] = homepageUrlsBySource[source] ?? [];
  }

  const totalUrlsFound = Object.values(sourceUrls).reduce((n, urls) => n + urls.length, 0);
  log.info({ rssSources, homepageSources, totalUrlsFound }, "Article URLs gathered");

  // Step 3: Scrape full article HTML (reuse existing integration)
  const sourcePages = await scrapePageHtml(sourceUrls);

  // Step 4: Parse HTML into NewsPiece objects (reuse existing service)
  const { newsPieces, metrics: parseMetrics } = parseHtmlWithMetrics(sourcePages);

  // Step 5: Group scraped NewsPieces by source, falling back to RSS descriptions
  // for sources that block scraping (e.g. NYT returns 403).
  const newsPiecesBySource: Record<string, NewsPiece[]> = {};
  for (const piece of newsPieces) {
    if (!newsPiecesBySource[piece.source]) {
      newsPiecesBySource[piece.source] = [];
    }
    newsPiecesBySource[piece.source].push(piece);
  }

  const summaryResults = await Promise.all(
    sources.map((source) => {
      const scraped = newsPiecesBySource[source] ?? [];

      // For RSS sources where scraping failed, fall back to the RSS descriptions
      const articlesToSummarize: NewsPiece[] =
        scraped.length > 0 || !rssFeedsBySource[source]
          ? scraped
          : (rssFeedsBySource[source] ?? []).map((rssArticle) => ({
              url: rssArticle.url,
              title: rssArticle.title,
              date: rssArticle.date,
              body: rssArticle.description ? [rssArticle.description] : [],
              source,
            }));

      if (scraped.length === 0 && articlesToSummarize.length > 0) {
        log.info(
          { source },
          "Scraping blocked, falling back to RSS descriptions for summarization"
        );
      }

      return summarizeArticles(source, articlesToSummarize, model);
    })
  );

  const allSummaries = summaryResults.flat();

  log.info(
    {
      requestId: context?.requestId ?? "unknown",
      sources,
      model,
      totalUrlsFound,
      pagesScraped: parseMetrics.parsedPages,
      parseFailures: parseMetrics.failedPages,
      summariesReturned: allSummaries.length,
    },
    "GetHeadlineNews request summary"
  );

  return allSummaries;
}
