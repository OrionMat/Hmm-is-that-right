import { getLogger } from "../../logger";
import { SourceUrls } from "../../dataModel/dataModel";
import { getSourceConfig } from "../../config/sources";

const log = getLogger("service/cleanUrls");

/**
 * Filters/Cleans URLs
 * @param rawSourceUrls Sources with a list of URLs for each source
 * @returns Sources with a clean list of URls for each source
 */
export function cleanUrls(rawSourceUrls: SourceUrls): SourceUrls {
  log.info(`Cleaning URLs: ${JSON.stringify(rawSourceUrls)}`);

  const cleanSourceUrls: SourceUrls = {};
  const counts: Record<string, { input: number; kept: number }> = {};

  for (const source in rawSourceUrls) {
    const rawUrls = rawSourceUrls[source];
    const { domainAllowlist } = getSourceConfig(source);

    if (domainAllowlist.length === 0) {
      log.warn({ source }, "No allowlist configured for source, dropping URLs");
    }

    const urls = rawUrls.filter((rawUrl) =>
      domainAllowlist.some((prefix) => rawUrl.includes(prefix))
    );

    cleanSourceUrls[source] = urls;
    counts[source] = { input: rawUrls.length, kept: urls.length };
  }

  log.info({ counts }, "URL cleaning metrics");
  log.info(`Cleaned URLS: ${JSON.stringify(cleanSourceUrls)}`);
  return cleanSourceUrls;
}
