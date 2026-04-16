import axios from "axios";
import { HeadlineSummary, LlmModelId } from "../dataModel/dataModel";

export async function getHeadlineNews(
  sources: string[],
  model: LlmModelId,
): Promise<HeadlineSummary[]> {
  const response = await axios.get("http://localhost:3001/getHeadlineNews", {
    params: { sources, model },
    paramsSerializer: { indexes: null },
  });
  return response.data;
}
