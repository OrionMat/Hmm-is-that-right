import axios, { AxiosResponse } from "axios";
import { RelevantNewsPiece, IsActiveNewsSources } from "./dataModel/dataModel";

export async function getNewsPieces(
  statement: string,
  sourceStates: IsActiveNewsSources
): Promise<RelevantNewsPiece[]> {
  const sources = Object.keys(sourceStates).filter(
    (sourceName) => sourceStates[sourceName as keyof IsActiveNewsSources]
  );
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
