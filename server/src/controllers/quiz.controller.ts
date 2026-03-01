import { Request, Response } from "express";
import { getLogger } from "../logger";
import { openAIService } from "../integration/openAIService";
import { QuizRequest, QuizSubmission } from "../schemas/quiz.schema";

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

export async function submitQuizController(
  request: Request,
  response: Response
) {
  const submission = request.validated?.body as QuizSubmission;
  const requestId = request.id ?? "unknown";

  log.info({ requestId }, "calculating quiz results on server");

  const { questions, answers, startTime, endTime } = submission;
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  const timeSpent = Math.floor((end.getTime() - start.getTime()) / 1000);

  const results = questions.map((question) => {
    const userAnswerId = answers[question.id];
    const userAnswer = question.options.find((opt) => opt.id === userAnswerId);
    const correctAnswer = question.options.find(
      (opt) => opt.id === question.correctAnswer
    );

    return {
      questionId: question.id,
      question: question.question,
      userAnswer: userAnswer?.text || "Not answered",
      correctAnswer: correctAnswer?.text || "",
      isCorrect: userAnswerId === question.correctAnswer,
      explanation: question.explanation,
    };
  });

  const correctAnswers = results.filter((r) => r.isCorrect).length;
  const score = Math.round((correctAnswers / questions.length) * 100);

  const quizResults = {
    totalQuestions: questions.length,
    correctAnswers,
    score,
    timeSpent,
    answers: results,
  };

  log.info({ requestId, score }, "quiz results calculated");
  response.json(quizResults);
}

