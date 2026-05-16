import { googleSearch, toSourceUrls } from "../../integration/googleSearch/googleSearch";
import { cleanUrls } from "../cleanUrls/cleanUrls";
import { SOURCE_KIND, SOURCE_STATUS, SourceQueryResult } from "../../dataModel/dataModel";
import { getLogger } from "../../logger";
import { FetchCandidatesResult, SectionCandidate, SectionSpec } from "./buildSection";

const log = getLogger("service/morningBrief/searchSpec");

const MAX_CANDIDATES_PER_SOURCE = 5;

/**
 * Builds a "search" section that uses SerpAPI to find articles matching a free-form
 * user query, scoped to the enabled news sources. URLs are filtered through cleanUrls
 * (domain allowlist + exclude patterns) before being handed to buildSection's
 * scrape → summarise pipeline.
 */
export function searchSpec(query: string, sources: string[]): SectionSpec {
  return {
    section: "search",
    displayName: `Search: "${query}"`,
    n: Math.min(sources.length * 2, 6),
    async fetchCandidates(): Promise<FetchCandidatesResult> {
      if (sources.length === 0) {
        return { candidates: [], sources: [] };
      }

      let rawResults;
      try {
        rawResults = await googleSearch(query, sources);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log.warn({ message }, "SerpAPI search failed");
        return {
          candidates: [],
          sources: sources.map((source) => ({
            source,
            kind: SOURCE_KIND.serpapi,
            status: SOURCE_STATUS.failed,
            articlesReturned: 0,
            error: message,
          })),
        };
      }

      const cleaned = cleanUrls(toSourceUrls(rawResults));

      const candidates: SectionCandidate[] = [];
      const sourceResults: SourceQueryResult[] = [];
      let i = 0;
      for (const source of sources) {
        const allowedUrls = new Set(cleaned[source] ?? []);
        const kept = (rawResults[source] ?? [])
          .filter((r) => allowedUrls.has(r.url))
          .slice(0, MAX_CANDIDATES_PER_SOURCE);
        for (const r of kept) {
          candidates.push({
            id: `s${i++}`,
            title: r.title || r.url,
            source,
            url: r.url,
            snippet: r.snippet,
          });
        }
        sourceResults.push({
          source,
          kind: SOURCE_KIND.serpapi,
          status: kept.length === 0 ? SOURCE_STATUS.empty : SOURCE_STATUS.ok,
          articlesReturned: kept.length,
        });
      }

      return { candidates, sources: sourceResults };
    },
  };
}
