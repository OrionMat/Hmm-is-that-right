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

  const newsPiece = {
    title: "Covid-19: 'No child's prospects should be blighted by pandemic'",
    date: "2021-02-24T19:51:56.000Z",
    author: "Zara McBeth",
    body:
      "Asked if the government was looking at lengthening the school day in the future, Mr Williamson said it was not part of the immediate plans announced, but it could be something considered as part of a wider consultation being led by education recovery commissioner Sir Kevan Collins into the longer term support and change needed within schools following the pandemic. This week, the government announced that secondary school and college students in England will be asked to take regular coronavirus tests at home when they return to school next month. Deputy chief medical officer for England Jenny Harries said more testing in secondary schools would mean that parents, teachers and grandparents could be reassured that schools would be as safe as they could be.",
    link: "https://www.bbc.co.uk/news/uk-56187673",
    source: "bbc",
  };
  return [newsPiece, newsPiece, newsPiece];

  // let response: AxiosResponse = {
  //   status: 500,
  //   data: {},
  //   statusText: "Error",
  //   headers: [],
  //   config: {},
  // };
  // try {
  //   response = await axios.get("http://localhost:3001/getNewsPieces", {
  //     params: { statement, sources },
  //   });
  //   console.log(response.data);
  // } catch (error) {
  //   console.log(error);
  // }
  // return response.data;
}
