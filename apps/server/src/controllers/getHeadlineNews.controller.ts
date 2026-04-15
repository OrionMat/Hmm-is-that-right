import { Request, Response } from "express";
import { getLogger } from "../logger";
import { getHeadlineNews } from "../service/getHeadlineNews";
import { GetHeadlineNewsQuery } from "../schemas/getHeadlineNews.schema";
import { SupportedModel } from "../integration/llmService/llmService";

const log = getLogger("controllers/getHeadlineNews");

type GetHeadlineNewsRequest = Request<
  Record<string, never>,
  unknown,
  unknown,
  GetHeadlineNewsQuery
>;

export async function getHeadlineNewsController(
  request: GetHeadlineNewsRequest,
  response: Response,
) {
  const { sources, model } = request.validated?.query as GetHeadlineNewsQuery;
  const requestId = request.id ? String(request.id) : "unknown";

  log.info({ requestId, sources, model }, "received getHeadlineNews request");

  const summaries = await getHeadlineNews(sources, model as SupportedModel, { requestId });
  response.json(summaries);
}
