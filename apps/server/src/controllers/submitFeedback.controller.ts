import { Request, Response } from "express";
import { getLogger } from "../logger";
import { submitFeedback } from "../service/morningBrief/submitFeedback";
import { SubmitFeedbackBody } from "../schemas/submitFeedback.schema";

const log = getLogger("controllers/submitFeedback");

export async function submitFeedbackController(request: Request, response: Response) {
  const { text } = request.validated?.body as SubmitFeedbackBody;
  const requestId = request.id ? String(request.id) : "unknown";

  log.info({ requestId, length: text.length }, "received feedback submission");

  try {
    await submitFeedback(text);
    response.json({ success: true });
  } catch (error) {
    log.error({ requestId, error }, "failed to save feedback");
    response.status(500).json({ error: "Failed to save feedback" });
  }
}
