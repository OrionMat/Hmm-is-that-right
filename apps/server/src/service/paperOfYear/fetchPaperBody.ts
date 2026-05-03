import { getLogger } from "../../logger";
import { fetchArxivText } from "../../integration/arxiv/arxiv";
import { cacheGet, cacheSet } from "../morningBrief/cache";
import { paperBodyCacheKey } from "./cacheKeys";
import { PaperOfYear } from "../../dataModel/dataModel";

const log = getLogger("service/paperOfYear/fetchPaperBody");
const PAPER_BODY_TTL_MS = 48 * 60 * 60 * 1000;

export interface PaperBodyResult {
  text: string;
  fromCache: boolean;
  fullTextAvailable: boolean;
}

export async function getPaperBody(paper: PaperOfYear): Promise<PaperBodyResult> {
  const key = paperBodyCacheKey(paper.arxivId);

  const cached = cacheGet<string>(key);
  if (cached !== undefined) {
    log.info({ arxivId: paper.arxivId, fromCache: true, fullTextAvailable: true }, "Paper body cache hit");
    return { text: cached, fromCache: true, fullTextAvailable: true };
  }

  const text = await fetchArxivText(paper.arxivId);

  if (text !== null) {
    cacheSet<string>(key, text, PAPER_BODY_TTL_MS);
    log.info({ arxivId: paper.arxivId, fromCache: false, fullTextAvailable: true }, "Paper body fetched and cached");
    return { text, fromCache: false, fullTextAvailable: true };
  }

  // Do not cache the fallback — allow retry on next request
  const fallback = `Full text unavailable — answering from abstract only.\n\nTitle: ${paper.title}\n\nAbstract:\n${paper.abstract}`;
  log.info({ arxivId: paper.arxivId, fromCache: false, fullTextAvailable: false }, "Paper body unavailable, using abstract fallback");
  return { text: fallback, fromCache: false, fullTextAvailable: false };
}
