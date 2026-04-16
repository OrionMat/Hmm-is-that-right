import { z } from "zod";
import { getLogger } from "../../logger";
import { NewsPiece, HeadlineSummary } from "../../dataModel/dataModel";
import { llmService, SupportedModel } from "../../integration/llmService/llmService";

const log = getLogger("service/summarizeArticles");

const headlineSummaryItemSchema = z.object({
  url: z.string(),
  title: z.string(),
  summary: z.array(z.string()).min(1),
});

const headlineSummaryArraySchema = z.array(headlineSummaryItemSchema);

/**
 * Builds the prompt to send to the LLM for batch summarization.
 * Sends all articles from a source in a single call to minimize round-trips.
 */
function buildSummarizationPrompt(source: string, articles: NewsPiece[]): string {
  const articleList = articles
    .map((article, index) => {
      const bodyText = article.body.filter(Boolean).join(" ").slice(0, 2000);
      const bodyOrFallback = bodyText || (article.title ?? "No content available");
      return `Article ${index + 1}:
URL: ${article.url}
Title: ${article.title ?? "Unknown"}
Body: ${bodyOrFallback}`;
    })
    .join("\n\n");

  return `You are a concise news summarizer. For each article below, produce 3-5 bullet points capturing the key facts and takeaways.

Respond ONLY with a valid JSON array. Each element must match this shape:
{ "url": "<exact url from input>", "title": "<exact title from input>", "summary": ["bullet 1", "bullet 2", ...] }

Source: ${source}

${articleList}`;
}

/**
 * Strips markdown code fences that some LLMs wrap around JSON responses.
 */
function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
}

/**
 * Sends a batch of articles from one source to the LLM and returns
 * HeadlineSummary objects with bullet point summaries.
 *
 * On LLM or parse failure, returns articles with an empty summary array
 * rather than throwing — callers should handle partial results gracefully.
 *
 * @param source The news source key (e.g. "bbc")
 * @param articles The scraped and parsed articles for that source
 * @param model The LLM model ID to use
 */
export async function summarizeArticles(
  source: string,
  articles: NewsPiece[],
  model: SupportedModel
): Promise<HeadlineSummary[]> {
  if (articles.length === 0) {
    log.warn({ source }, "No articles to summarize");
    return [];
  }

  log.info({ source, articleCount: articles.length, model }, "Summarizing articles");

  let rawResponse: string;
  try {
    const prompt = buildSummarizationPrompt(source, articles);
    rawResponse = await llmService.complete(prompt, model);
  } catch (error) {
    log.warn({ source, error }, "LLM call failed, returning articles without summaries");
    return articles.map((article) => ({
      source,
      url: article.url,
      title: article.title ?? "Unknown",
      date: article.date,
      summary: [],
    }));
  }

  // Parse and validate the JSON response
  let parsed: z.infer<typeof headlineSummaryArraySchema>;
  try {
    const cleaned = stripCodeFences(rawResponse);
    parsed = headlineSummaryArraySchema.parse(JSON.parse(cleaned));
  } catch (error) {
    log.warn({ source, error, rawResponse }, "Failed to parse LLM response, returning articles without summaries");
    return articles.map((article) => ({
      source,
      url: article.url,
      title: article.title ?? "Unknown",
      date: article.date,
      summary: [],
    }));
  }

  // Merge LLM summaries back with the original articles (preserving date from parsed article)
  const summaryByUrl = new Map(parsed.map((item) => [item.url, item.summary]));

  const results: HeadlineSummary[] = articles.map((article) => ({
    source,
    url: article.url,
    title: article.title ?? "Unknown",
    date: article.date,
    summary: summaryByUrl.get(article.url) ?? [],
  }));

  log.info({ source, summarized: results.length }, "Articles summarized successfully");
  return results;
}
