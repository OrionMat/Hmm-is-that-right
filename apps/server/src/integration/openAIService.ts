import OpenAI from "openai";
import { z } from "zod";
import { getLogger } from "../logger";

const log = getLogger("integration/openAIService");

export interface OpenAIQuizRequest {
  topic: string;
  questionCount: number;
  difficulty?: "easy" | "medium" | "hard";
  category?: string;
}

export interface OpenAIQuizResponse {
  questions: Array<{
    id: string;
    question: string;
    options: Array<{
      id: string;
      text: string;
      label: string;
    }>;
    correctAnswer: string;
    explanation: string;
    category: string;
    difficulty: "easy" | "medium" | "hard";
  }>;
}

const openAIOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  label: z.string(),
});

const openAIQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(openAIOptionSchema).length(4),
  correctAnswer: z.string(),
  explanation: z.string(),
  category: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

const openAIResponseSchema = z.object({
  questions: z.array(openAIQuestionSchema).min(1),
});

export class OpenAIService {
  private openai: OpenAI;
  // NOTE: This cache is process-local — it won't be shared across multiple server instances.
  private cache = new Map<string, { data: OpenAIQuizResponse; expiry: number }>();
  private CACHE_TTL = 1000 * 60 * 60; // 1 hour

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateQuizQuestions(
    request: OpenAIQuizRequest,
  ): Promise<OpenAIQuizResponse> {
    const cacheKey = JSON.stringify(request);
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      log.info({ topic: request.topic }, "Serving quiz questions from cache");
      return cached.data;
    }

    if (!process.env.OPENAI_API_KEY) {
      log.warn("OpenAI API key not configured, using mock fallback");
      return this.getMockQuizQuestions(request);
    }

    const prompt = this.buildQuizPrompt(request);

    try {
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that generates educational quiz questions in JSON format. You must strictly follow the provided schema.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("No content received from OpenAI");

      const parseResult = openAIResponseSchema.safeParse(JSON.parse(content));
      if (!parseResult.success) {
        log.error({ error: parseResult.error }, "OpenAI response failed schema validation");
        throw new Error("Invalid response structure from OpenAI");
      }

      const formatted: OpenAIQuizResponse = {
        questions: parseResult.data.questions.map((q) => ({
          ...q,
          category: q.category ?? request.category ?? "General",
          difficulty: q.difficulty ?? request.difficulty ?? "medium",
        })),
      };

      this.cache.set(cacheKey, {
        data: formatted,
        expiry: Date.now() + this.CACHE_TTL,
      });

      return formatted;
    } catch (error) {
      log.error({ error }, "OpenAI API error");

      if (
        error instanceof OpenAI.APIError &&
        (error.status === 429 || error.code === "insufficient_quota")
      ) {
        log.warn("Quota exceeded, falling back to mock data");
        return this.getMockQuizQuestions(request);
      }

      throw new Error("Failed to generate quiz questions from OpenAI");
    }
  }

  private buildQuizPrompt(request: OpenAIQuizRequest): string {
    const { topic, questionCount, difficulty = "medium", category } = request;

    return `Generate ${questionCount} multiple-choice quiz questions about "${topic}".

The response MUST be a JSON object with a "questions" array.
Each question object MUST have:
- id: a unique string (e.g. "q1")
- question: the text of the question
- options: an array of 4 objects, each with "id" (e.g. "opt-1"), "text", and "label" (A, B, C, or D)
- correctAnswer: the "id" of the correct option
- explanation: why that answer is correct
- category: "${category || "General"}"
- difficulty: "${difficulty}"

Example format:
{
  "questions": [
    {
      "id": "q1",
      "question": "Sample?",
      "options": [{"id": "o1", "text": "Yes", "label": "A"}, ...],
      "correctAnswer": "o1",
      "explanation": "Because.",
      "category": "General",
      "difficulty": "medium"
    }
  ]
}`;
  }

  private getMockQuizQuestions(
    request: OpenAIQuizRequest,
  ): OpenAIQuizResponse {
    const { topic, difficulty = "medium", category } = request;
    return {
      questions: [
        {
          id: "mock-1",
          question: `Which of the following is a key component of critical thinking when analyzing ${topic}?`,
          options: [
            {
              id: "m1-a",
              text: "Accepting information at face value",
              label: "A",
            },
            {
              id: "m1-b",
              text: "Identifying underlying assumptions",
              label: "B",
            },
            { id: "m1-c", text: "Sharing without verifying", label: "C" },
            {
              id: "m1-d",
              text: "Ignoring conflicting evidence",
              label: "D",
            },
          ],
          correctAnswer: "m1-b",
          explanation:
            "Critical thinking involves digging deeper into why a claim is being made.",
          category: category || "Media Literacy",
          difficulty,
        },
      ],
    };
  }
}

export const openAIService = new OpenAIService();
