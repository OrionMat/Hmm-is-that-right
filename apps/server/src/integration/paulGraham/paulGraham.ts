import axios from "axios";
import { getLogger } from "../../logger";

const log = getLogger("integration/paulGraham");

const INDEX_URL = "https://paulgraham.com/articles.html";
const BASE_URL = "https://paulgraham.com";
const FETCH_TIMEOUT_MS = 10000;

export interface PgEssay {
  title: string;
  url: string;
}

/**
 * Scrapes the Paul Graham essays index and returns all listed essays.
 * The page is plain static HTML — stable enough for a simple regex approach.
 */
export async function listEssays(): Promise<PgEssay[]> {
  log.debug("Fetching Paul Graham essay index");

  try {
    const { data: html } = await axios.get<string>(INDEX_URL, {
      timeout: FETCH_TIMEOUT_MS,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    // PG's index uses plain <a href="essay.html"> links inside table cells
    const pattern = /<a href="([a-z0-9]+\.html)">([^<]+)<\/a>/gi;
    const essays: PgEssay[] = [];
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(html)) !== null) {
      essays.push({
        url: `${BASE_URL}/${match[1]}`,
        title: match[2].trim(),
      });
    }

    log.info({ count: essays.length }, "Paul Graham essays listed");
    return essays;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.warn({ message }, "Failed to fetch PG essay index, returning empty");
    return [];
  }
}
