import axios, { AxiosResponse } from "axios";

export interface NewsPiece {
  title: string | null | undefined;
  date: string | null | undefined;
  author: string | null | undefined;
  body: string;
  link: string;
  source: string;
}

export interface ActiveSources {
  isBbcActive: boolean;
  isNytActive: boolean;
  isApActive: boolean;
  isReutersActive: boolean;
  isTwitterActive: boolean;
}

export async function getNewsPieces(
  statement: string,
  activeSources: ActiveSources
): Promise<NewsPiece[]> {
  const activeSourcesMap = new Map();
  activeSourcesMap.set("isBbcActive", "bbc");
  activeSourcesMap.set("isNytActive", "nyt");
  activeSourcesMap.set("isApActive", "ap");
  activeSourcesMap.set("isReutersActive", "reuters");
  activeSourcesMap.set("isTwitterActive", "twitter");

  let sources: string[] = [];
  for (let [sourceActive, isActive] of Object.entries(activeSources)) {
    console.log(sourceActive, isActive);
    if (isActive) {
      const source = activeSourcesMap.get(sourceActive);
      sources.push(source);
    }
  }
  console.log(sources);
  let response: AxiosResponse = {
    status: 500,
    data: {},
    statusText: "Error",
    headers: [],
    config: {},
  };
  try {
    response = await axios.get("http://localhost:3001/getNewsPieces", {
      params: { statement, sources },
    });
    console.log(response.data);
  } catch (error) {
    console.log(error);
  }
  return response.data;
}
