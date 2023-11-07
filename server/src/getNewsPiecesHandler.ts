import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { getLogger } from "./logger";
import { getNewsPieces } from "./service/getNewsPieces";
import { buildResponse } from "./integration/buildResponse";

const log = getLogger("getNewsPiecesHandler");

export const getNewsPiecesHandler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  console.log(`Hello`);

  if (event.body === null) {
    return buildResponse(StatusCodes.BAD_REQUEST, {
      message: "Received null body.",
    });
  }

  const eventBody = JSON.parse(event.body);
  log.info(`received request with query: ${JSON.stringify(eventBody?.query)}`);

  const statement = eventBody.query.statement as string;
  const sources = eventBody.query.sources as string[];
  if (!statement || !sources) {
    log.error(
      `Bad request. No statement or no sources received. Request: ${JSON.stringify(
        eventBody.query
      )}`
    );
    return buildResponse(StatusCodes.BAD_REQUEST, {
      message: "Bad request. No statement or no sources received.",
    });
  }

  let response;
  try {
    const newsPieces = await getNewsPieces(statement, sources);
    response = buildResponse(StatusCodes.OK, newsPieces);
  } catch (error) {
    log.error("Internal server error: ", error);
    response = buildResponse(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Internal server error.",
    });
  }

  return response;
};
