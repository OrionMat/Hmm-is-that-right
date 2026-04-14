import axios, { AxiosResponse } from "axios";
import { NewsPiece, IsActiveNewsSources } from "../dataModel/dataModel";

export async function getNewsPieces(
  statement: string,
  sourceStates: IsActiveNewsSources,
): Promise<NewsPiece[]> {
  const sources = Object.keys(sourceStates).filter(
    (sourceName) => sourceStates[sourceName as keyof IsActiveNewsSources],
  );
  const cacheKey = `newsPieces:${statement.trim().toLowerCase()}:${[...sources].sort().join(",")}`;
  const cachedValue = sessionStorage.getItem(cacheKey);
  if (cachedValue) {
    return JSON.parse(cachedValue) as NewsPiece[];
  }

  let response: AxiosResponse | undefined;
  try {
    response = await axios.get("http://localhost:3001/getNewsPieces", {
      params: { statement, sources },
      paramsSerializer: { indexes: null },
    });
    if (response?.data) {
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
      } catch (e) {
        if (e instanceof DOMException && e.name === "QuotaExceededError") {
          console.warn("sessionStorage quota exceeded; skipping cache write");
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
  return (
    response?.data || {
      status: 500,
      data: {},
      statusText: "Error",
      headers: [],
      config: {},
    }
  );
}
