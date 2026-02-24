import { QuizQuestion } from "../dataModel/quizModel";
import { ThirdPartyQuestion, GenerateQuizRequest } from "./thirdPartyApi";
import axios from "axios";

export class QuizServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "QuizServiceError";
  }
}

// Convert third-party API response to our internal QuizQuestion format
const convertToQuizQuestion = (
  thirdPartyQuestion: ThirdPartyQuestion,
): QuizQuestion => {
  return {
    id: thirdPartyQuestion.id,
    question: thirdPartyQuestion.question,
    options: thirdPartyQuestion.options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      label: opt.label,
    })),
    correctAnswer: thirdPartyQuestion.correctAnswer,
    explanation: thirdPartyQuestion.explanation,
  };
};

export const getQuizQuestions = async (): Promise<QuizQuestion[]> => {
  try {
    // Generate quiz questions using server's OpenAI integration
    const request: GenerateQuizRequest = {
      topic: "Media Literacy and Critical Thinking",
      questionCount: 5,
      difficulty: "medium",
      category: "Media Literacy",
    };

    // Call our server endpoint which integrates with OpenAI
    const response = await axios.post(
      "http://localhost:3001/api/quiz/questions",
      request,
    );

    // Convert to our internal format
    return response.data.questions.map(convertToQuizQuestion);
  } catch (error) {
    if (error instanceof QuizServiceError) {
      throw error;
    }

    // Handle specific error cases
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 500) {
        const errorMessage = error.response.data?.error || "Server error";
        if (errorMessage.includes("API key not configured")) {
          throw new QuizServiceError(
            "OpenAI API key not configured on server",
            "API_KEY_ERROR",
          );
        }
        throw new QuizServiceError("Server error occurred", "SERVER_ERROR");
      }
      if (error.code === "ECONNREFUSED") {
        throw new QuizServiceError("Server is not running", "CONNECTION_ERROR");
      }
    }

    throw new QuizServiceError(
      "Unexpected error loading quiz questions",
      "UNKNOWN_ERROR",
    );
  }
};

export const calculateQuizResults = (
  questions: QuizQuestion[],
  answers: Record<string, string>,
  startTime: Date,
  endTime: Date,
) => {
  const timeSpent = Math.floor(
    (endTime.getTime() - startTime.getTime()) / 1000,
  );

  const results = questions.map((question) => {
    const userAnswerId = answers[question.id];
    const userAnswer = question.options.find((opt) => opt.id === userAnswerId);
    const correctAnswer = question.options.find(
      (opt) => opt.id === question.correctAnswer,
    );

    const isCorrect = userAnswerId === question.correctAnswer;

    return {
      questionId: question.id,
      question: question.question,
      userAnswer: userAnswer?.text || "Not answered",
      correctAnswer: correctAnswer?.text || "",
      isCorrect,
      explanation: question.explanation,
    };
  });

  const correctAnswers = results.filter((result) => result.isCorrect).length;
  const score = Math.round((correctAnswers / questions.length) * 100);

  return {
    totalQuestions: questions.length,
    correctAnswers,
    score,
    timeSpent,
    answers: results,
  };
};
