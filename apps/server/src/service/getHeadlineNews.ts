import { getLogger } from "../logger";
import { fetchRssFeeds } from "../integration/fetchRssFeed/fetchRssFeed";
import { scrapePageHtml } from "../integration/scrapePageHtml/scrapePageHtml";
import { parseHtmlWithMetrics } from "./parseHtml/parseHtml";
import { summarizeArticles } from "./summarizeArticles/summarizeArticles";
import { HeadlineSummary, SourceUrls } from "../dataModel/dataModel";
import { SupportedModel } from "../integration/llmService/llmService";

const log = getLogger("service/getHeadlineNews");

/**
 * Fetches current headline news for each selected source, scrapes the full
 * article content, and summarizes each article into bullet points via LLM.
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

  // Step 1: Fetch RSS feeds for all sources in parallel
  const rssFeedsBySource = await fetchRssFeeds(sources);

  const totalRssArticles = Object.values(rssFeedsBySource).reduce(
    (total, articles) => total + articles.length,
    0
  );
  log.info({ totalRssArticles }, "RSS feeds fetched");

  // Step 2: Build SourceUrls map from RSS article links (reuses scrapePageHtml as-is)
  const sourceUrls: SourceUrls = {};
  for (const source of sources) {
    const articles = rssFeedsBySource[source] ?? [];
    sourceUrls[source] = articles.map((a) => a.url).filter(Boolean);
  }

  // Step 3: Scrape full article HTML (reuse existing integration)
  const sourcePages = await scrapePageHtml(sourceUrls);

  // Step 4: Parse HTML into NewsPiece objects (reuse existing service)
  const { newsPieces, metrics: parseMetrics } = parseHtmlWithMetrics(sourcePages);

  // Step 5: Group NewsPieces by source, then summarize each source in parallel
  const newsPiecesBySource: Record<string, typeof newsPieces> = {};
  for (const piece of newsPieces) {
    if (!newsPiecesBySource[piece.source]) {
      newsPiecesBySource[piece.source] = [];
    }
    newsPiecesBySource[piece.source].push(piece);
  }

  const summaryResults = await Promise.all(
    sources.map((source) =>
      summarizeArticles(source, newsPiecesBySource[source] ?? [], model)
    )
  );

  const allSummaries = summaryResults.flat();

  log.info(
    {
      requestId: context?.requestId ?? "unknown",
      sources,
      model,
      totalRssArticles,
      pagesScraped: parseMetrics.parsedPages,
      parseFailures: parseMetrics.failedPages,
      summariesReturned: allSummaries.length,
    },
    "GetHeadlineNews request summary"
  );

  return allSummaries;
}
