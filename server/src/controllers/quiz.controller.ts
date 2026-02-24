import { Request, Response } from "express";
import { getLogger } from "../logger";
import { openAIService } from "../integration/openAIService";
import { QuizRequest } from "../schemas/quiz.schema";

const log = getLogger("controllers/quiz");

export async function generateQuizController(
  request: Request,
  response: Response
) {
  const quizRequest = request.validated?.body as QuizRequest;
  const requestId = request.id ?? "unknown";

  log.info(
    { requestId, topic: quizRequest.topic },
    "received quiz generation request"
  );

  try {
    const quizQuestions = await openAIService.generateQuizQuestions(quizRequest);
    log.info(
      { requestId, count: quizQuestions.questions.length },
      "successfully generated quiz questions"
    );
    response.json(quizQuestions);
  } catch (error) {
    log.error({ requestId, error }, "error generating quiz questions");
    
    if (error instanceof Error && error.message.includes("API key not configured")) {
      return response.status(500).json({ error: "OpenAI API key not configured on server" });
    }
    
    response.status(500).json({ error: "Failed to generate quiz questions" });
  }
}

export async function testQuizConnectionController(
  request: Request,
  response: Response
) {
  const requestId = request.id ?? "unknown";
  log.info({ requestId }, "testing OpenAI connection");

  try {
    const isConnected = await openAIService.testConnection();
    response.json({
      connected: isConnected,
      message: isConnected
        ? "OpenAI API connection successful"
        : "OpenAI API connection failed",
    });
  } catch (error) {
    log.error({ requestId, error }, "OpenAI connection test error");
    response.status(500).json({ error: "Failed to test OpenAI connection" });
  }
}
