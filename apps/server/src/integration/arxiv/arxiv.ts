import axios from "axios";
import { JSDOM } from "jsdom";
import { getLogger } from "../../logger";

const log = getLogger("integration/arxiv");

const ARXIV_HTML_BASE = "https://arxiv.org/html";
const ARXIV_TIMEOUT_MS = 20000;
const MAX_CHARS = 30000;
const USER_AGENT = "web:hmm-is-that-right:1.0";

export async function fetchArxivText(arxivId: string): Promise<string | null> {
  try {
    const response = await axios.get(`${ARXIV_HTML_BASE}/${arxivId}`, {
      timeout: ARXIV_TIMEOUT_MS,
      headers: { "User-Agent": USER_AGENT },
      validateStatus: () => true,
      responseType: "text",
    });

    if (response.status !== 200) {
      log.warn({ arxivId, status: response.status }, "arXiv HTML not available");
      return null;
    }

    const doc = new JSDOM(response.data as string).window.document;
    const raw =
      doc.querySelector("article")?.textContent ?? doc.body?.textContent ?? "";

    if (!raw.trim()) {
      log.warn({ arxivId }, "arXiv HTML parsed but no text extracted");
      return null;
    }

    const cleaned = raw
      .replace(/\n{3,}/g, "\n\n")
      .replace(/ {2,}/g, " ")
      .trim()
      .slice(0, MAX_CHARS);

    log.info({ arxivId, chars: cleaned.length }, "arXiv text extracted");
    return cleaned;
  } catch (err) {
    log.warn({ arxivId, err }, "arXiv fetch failed");
    return null;
  }
}
