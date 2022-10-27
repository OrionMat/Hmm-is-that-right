import { getLogger } from "../../logger";
import { SourceUrls } from "../../dataModel/dataModel";

const log = getLogger("service/cleanUrls");

/**
 * Filters/Cleans URLs
 * @param rawSourceUrls Sources with a list of URLs for each source
 * @returns Sources with a clean list of URls for each source
 */
export function cleanUrls(rawSourceUrls: SourceUrls): SourceUrls {
  log.info(`Cleaning URLs: ${JSON.stringify(rawSourceUrls)}`);

  let cleanSourceUrls: SourceUrls = {};
  for (const source in rawSourceUrls) {
    const rawUrls = rawSourceUrls[source]; // ["www.", "www.", "www.", ...]

    let filterKey = "";
    switch (source.toLowerCase()) {
      case "bbc":
        filterKey = "https://www.bbc.";
        break;
      case "nyt":
        filterKey = "https://www.nytimes.";
        break;
      case "ap":
        filterKey = "https://apnews.";
        break;
      case "reuters":
        filterKey = "https://www.reuters.";
        break;
      default:
        filterKey = "https://www.";
        log.warn("No cleaning/filtering of URLs as no source match");
        break;
    }

    let urls: string[] | null = null;
    urls = rawUrls.filter((rawUrl) => rawUrl.includes(filterKey as string));

    cleanSourceUrls[source] = urls;
  }

  log.info(`Cleaned URLS: ${JSON.stringify(cleanSourceUrls)}`);
  return cleanSourceUrls;
}
