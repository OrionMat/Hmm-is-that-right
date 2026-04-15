import axios, { AxiosResponse } from "axios";
import { HeadlineSummary, LlmModelId } from "../dataModel/dataModel";

export async function getHeadlineNews(
  sources: string[],
  model: LlmModelId,
): Promise<HeadlineSummary[]> {
  let response: AxiosResponse | undefined;
  try {
    response = await axios.get("http://localhost:3001/getHeadlineNews", {
      params: { sources, model },
      paramsSerializer: { indexes: null },
    });
  } catch (error) {
    console.error(error);
  }
  return response?.data ?? [];
}
