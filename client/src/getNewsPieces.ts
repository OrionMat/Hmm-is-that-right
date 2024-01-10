import axios, { AxiosResponse } from "axios";
import { NewsPiece, IsActiveNewsSources } from "./dataModel/dataModel";

export async function getNewsPieces(
  statement: string,
  sourceStates: IsActiveNewsSources
): Promise<NewsPiece[]> {
  const sources = Object.keys(sourceStates).filter(
    (sourceName) => sourceStates[sourceName as keyof IsActiveNewsSources]
  );
  console.log(sources);

  let response: AxiosResponse | undefined;
  try {
    response = await axios.get("http://localhost:3001/getNewsPieces", {
      params: { statement, sources },
    });
    console.log(response?.data);
  } catch (error) {
    console.log(error);
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
