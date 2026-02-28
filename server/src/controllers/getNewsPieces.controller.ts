import { Request, Response } from "express";
import { getLogger } from "../logger";
import { getNewsPieces } from "../service/getNewsPieces";
import { GetNewsPiecesQuery } from "../schemas/getNewsPieces.schema";

const log = getLogger("controllers/getNewsPieces");

type GetNewsPiecesRequest = Request<
  Record<string, never>,
  unknown,
  unknown,
  GetNewsPiecesQuery
>;

export async function getNewsPiecesController(
  request: GetNewsPiecesRequest,
  response: Response,
) {
  const { statement, sources } = request.validated?.query as GetNewsPiecesQuery;
  const requestId = request.id ? String(request.id) : "unknown";

  log.info(
    {
      requestId,
      statement,
      sources,
    },
    "received getNewsPieces request",
  );

  const newsPieces = await getNewsPieces(statement, sources, { requestId });
  response.json(newsPieces);
}
