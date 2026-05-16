import axios from "axios";
import { getLogger } from "../../logger";
import { serverConfig } from "../../config/serverConfig";
import { PaperCandidate } from "../../dataModel/dataModel";

const log = getLogger("integration/semanticScholar");

export class SemanticScholarRateLimitError extends Error {
  constructor() {
    super("Semantic Scholar rate limit exceeded — try again later");
    this.name = "SemanticScholarRateLimitError";
  }
}

const BASE_URL = "https://api.semanticscholar.org/graph/v1/paper/search";
const FETCH_TIMEOUT_MS = 15000;
const OPEN_ACCESS_STATUSES = new Set(["GREEN", "HYBRID"]);

export async function fetchTopPapers(): Promise<PaperCandidate[]> {
  const now = new Date();
  const thisYear = now.getUTCFullYear();
  const lastYear = thisYear - 1;

  const headers: Record<string, string> = {};
  if (serverConfig.semanticScholarApiKey) {
    headers["x-api-key"] = serverConfig.semanticScholarApiKey;
  }

  try {
    const response = await axios.get(BASE_URL, {
      timeout: FETCH_TIMEOUT_MS,
      headers,
      params: {
        query: "computer science machine learning AI",
        fields: "title,abstract,citationCount,year,authors,externalIds,openAccessPdf",
        fieldsOfStudy: "Computer Science",
        publicationDateOrYear: `${lastYear}:${thisYear}`,
        limit: 50,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any[] = response.data?.data ?? [];

    const candidates: PaperCandidate[] = data
      .filter(
        (p) =>
          typeof p.externalIds?.ArXiv === "string" &&
          p.externalIds.ArXiv.length > 0 &&
          OPEN_ACCESS_STATUSES.has(p.openAccessPdf?.status),
      )
      .sort((a, b) => (b.citationCount ?? 0) - (a.citationCount ?? 0))
      .slice(0, 10)
      .map((p) => ({
        semanticScholarId: p.paperId ?? "",
        arxivId: p.externalIds.ArXiv as string,
        title: p.title ?? "",
        abstract: p.abstract ?? "",
        authors: (p.authors ?? []).map((a: { name: string }) => a.name),
        year: p.year ?? thisYear,
        citationCount: p.citationCount ?? 0,
      }));

    log.info({ candidateCount: candidates.length }, "Semantic Scholar candidates fetched");
    return candidates;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 429) {
      log.warn({ err }, "Semantic Scholar fetch failed");
      throw new SemanticScholarRateLimitError();
    }
    log.warn({ err }, "Semantic Scholar fetch failed");
    return [];
  }
}
