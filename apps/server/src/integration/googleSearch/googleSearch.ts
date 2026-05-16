import axios from "axios";
import { getLogger } from "../../logger";
import { serverConfig } from "../../config/serverConfig";
import { SourceUrls } from "../../dataModel/dataModel";

const log = getLogger("integration/googleSearch");

export interface GoogleSearchResult {
  url: string;
  title: string;
  snippet?: string;
}

export type SearchResultsBySource = Record<string, GoogleSearchResult[]>;

/**
 * Searches Google (via SerpAPI) for `statement` scoped per source. Returns the
 * top organic results (url + title + snippet) keyed by source. ~125 SerpAPI
 * credits per call (one request per source).
 */
export async function googleSearch(
  statement: string,
  sources: string[]
): Promise<SearchResultsBySource> {
  log.info({ sources, statement }, "Google searching news sources");

  const queries = sources.map((source) => `${source} + ${statement}`);

  const paramsList = queries.map((query) => ({
    api_key: serverConfig.serpSearchApiKey,
    q: query,
    engine: "google",
    num: 10,
    gl: "us",
    hl: "en",
  }));

  const resultsBySource: SearchResultsBySource = {};
  try {
    const rawResults = paramsList.map((params) =>
      axios.get("https://serpapi.com/search", { params })
    );

    const rawDataList = (await Promise.allSettled(rawResults)).map((result) =>
      result.status === "fulfilled" ? result.value.data : undefined
    );

    sources.forEach((source, index) => {
      const organic = rawDataList[index]?.organic_results ?? [];
      resultsBySource[source] = organic
        .filter((r: { link?: unknown }) => typeof r.link === "string")
        .map((r: { link: string; title?: string; snippet?: string }) => ({
          url: r.link,
          title: typeof r.title === "string" ? r.title : "",
          snippet: typeof r.snippet === "string" ? r.snippet : undefined,
        }));
    });
  } catch (error) {
    log.error({ error }, "Error searching Google");
    throw new Error(`Searching Google: ${error}`);
  }

  log.info(
    { counts: Object.fromEntries(Object.entries(resultsBySource).map(([s, r]) => [s, r.length])) },
    "Google search results"
  );
  return resultsBySource;
}

/** Convenience: collapse the rich result map back to a plain URLs-per-source map. */
export function toSourceUrls(results: SearchResultsBySource): SourceUrls {
  const out: SourceUrls = {};
  for (const [source, items] of Object.entries(results)) {
    out[source] = items.map((r) => r.url);
  }
  return out;
}
