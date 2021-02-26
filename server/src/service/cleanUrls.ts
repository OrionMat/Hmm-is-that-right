const filterUrls = async (source: string, sourceRawLinks: string[]) => {
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
      console.log("filterLinks Error: no source match");
      break;
  }

  const links = sourceRawLinks.filter((rawLink) => rawLink.includes(filterKey));
  return links;
};

export const cleanUrls = async (
  sources: string[],
  rawLinks: string[][]
): Promise<string[][]> => {
  let cleanLinks: string[][] = [];
  for (
    let sourceIndex = 0, sourceNum = sources.length;
    sourceIndex < sourceNum;
    sourceIndex++
  ) {
    const source = sources[sourceIndex];
    const sourceRawLinks = rawLinks[sourceIndex];
    const sourceLinks = await filterUrls(source, sourceRawLinks);
    cleanLinks.push(sourceLinks);
  }
  return cleanLinks;
};
