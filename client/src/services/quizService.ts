import { QuizQuestion, QuizResults } from "../dataModel/quizModel";
import { GenerateQuizRequest } from "./thirdPartyApi";
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

// Base URL for the API
const API_BASE_URL = "http://localhost:3001/api/quiz";

export const getQuizQuestions = async (options?: Partial<GenerateQuizRequest>): Promise<QuizQuestion[]> => {
  try {
    const request: GenerateQuizRequest = {
      topic: options?.topic || "Media Literacy and Critical Thinking",
      questionCount: options?.questionCount || 5,
      difficulty: options?.difficulty || "medium",
      category: options?.category || "Media Literacy",
    };

    const response = await axios.post(`${API_BASE_URL}/questions`, request);
    return response.data.questions;
  } catch (error) {
    return handleAxiosError(error, "Unexpected error loading quiz questions");
  }
};

export const submitQuizAnswers = async (
  questions: QuizQuestion[],
  answers: Record<string, string>,
  startTime: Date,
  endTime: Date
): Promise<QuizResults> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/results`, {
      questions,
      answers,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });
    return response.data;
  } catch (error) {
    return handleAxiosError(error, "Unexpected error calculating quiz results");
  }
};

const handleAxiosError = (error: any, defaultMessage: string): never => {
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
  throw new QuizServiceError(defaultMessage, "UNKNOWN_ERROR");
};
