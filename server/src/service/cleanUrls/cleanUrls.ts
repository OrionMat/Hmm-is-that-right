import { SourceUrls } from "../../dataModel/dataModel";

/**
 * Filters/Cleans URLs
 * @param rawSourceUrls  Sources with a list of URLs for each source
 * @returns Sources with a clean list of URls for each source
 */
export const cleanUrls = async (
  rawSourceUrls: SourceUrls
): Promise<SourceUrls> => {
  let cleanSourceUrls: SourceUrls = {};
  for (const source in rawSourceUrls) {
    const rawUrls = rawSourceUrls[source]; // ["www.", "www.", "www.", ...]

    let filterKey: string | null = null;
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
        console.log(
          "cleanURLs: No cleaning/filtering of URLs as no source match"
        );
        break;
    }

    let urls: string[] | null = null;
    urls = rawUrls.filter((rawUrl) => rawUrl.includes(filterKey as string));

    cleanSourceUrls[source] = urls;
  }
  console.log("Cleaned URLS: ", cleanSourceUrls);
  return cleanSourceUrls;
};
