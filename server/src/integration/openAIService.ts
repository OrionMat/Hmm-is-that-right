import OpenAI from "openai";

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

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate quiz questions using OpenAI's GPT model
   */
  async generateQuizQuestions(
    request: OpenAIQuizRequest,
  ): Promise<OpenAIQuizResponse> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    const prompt = this.buildQuizPrompt(request);

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a quiz generator that creates high-quality multiple-choice questions. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      // Parse JSON response more robustly
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        // Try to extract JSON from content if it's wrapped in code blocks
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error("Invalid JSON response from OpenAI");
        }
      }

      return this.formatQuizResponse(parsed, request);
    } catch (error) {
      console.error("OpenAI API error:", error);

      // Better error handling with OpenAI error types
      if (error instanceof OpenAI.APIError) {
        console.error("OpenAI API Error:", error.message);
        console.error("OpenAI API Status:", error.status);
        console.error("OpenAI API Code:", error.code);

        // Fallback to mock data if quota exceeded
        if (error.status === 429 || error.code === "insufficient_quota") {
          console.warn(
            "OpenAI quota exceeded. Falling back to mock quiz questions.",
          );
          return this.getMockQuizQuestions(request);
        }
      }

      throw new Error("Failed to generate quiz questions from OpenAI");
    }
  }

  /**
   * Fallback mock quiz questions when OpenAI API is unavailable
   */
  private getMockQuizQuestions(request: OpenAIQuizRequest): OpenAIQuizResponse {
    const {
      topic,
      questionCount = 5,
      difficulty = "medium",
      category,
    } = request;

    return {
      questions: [
        {
          id: "q1",
          question: `What is the primary purpose of media literacy in the digital age?`,
          options: [
            {
              id: "opt-1",
              text: "To consume as much media as possible",
              label: "A",
            },
            {
              id: "opt-2",
              text: "To critically analyze and evaluate media messages",
              label: "B",
            },
            {
              id: "opt-3",
              text: "To create media content exclusively",
              label: "C",
            },
            { id: "opt-4", text: "To avoid all media consumption", label: "D" },
          ],
          correctAnswer: "opt-2",
          explanation:
            "Media literacy focuses on developing critical thinking skills to analyze, evaluate, and create media messages effectively.",
          category: category || "Media Literacy",
          difficulty: difficulty,
        },
        {
          id: "q2",
          question: `Which of the following is a key indicator of misinformation in ${topic}?`,
          options: [
            { id: "opt-1", text: "Verified sources and citations", label: "A" },
            {
              id: "opt-2",
              text: "Emotional language without evidence",
              label: "B",
            },
            {
              id: "opt-3",
              text: "Balanced perspective presentation",
              label: "C",
            },
            {
              id: "opt-4",
              text: "Multiple independent confirmations",
              label: "D",
            },
          ],
          correctAnswer: "opt-2",
          explanation:
            "Emotional language lacking factual evidence is often a red flag for misinformation.",
          category: category || "Media Literacy",
          difficulty: difficulty,
        },
        {
          id: "q3",
          question: `What is the first step in fact-checking information?`,
          options: [
            {
              id: "opt-1",
              text: "Sharing the information immediately",
              label: "A",
            },
            { id: "opt-2", text: "Verifying the original source", label: "B" },
            { id: "opt-3", text: "Checking if friends agree", label: "C" },
            { id: "opt-4", text: "Counting likes and shares", label: "D" },
          ],
          correctAnswer: "opt-2",
          explanation:
            "Always verify the original source before accepting or sharing information.",
          category: category || "Media Literacy",
          difficulty: difficulty,
        },
        {
          id: "q4",
          question: `Which characteristic defines critical thinking in media consumption?`,
          options: [
            {
              id: "opt-1",
              text: "Accepting all information at face value",
              label: "A",
            },
            {
              id: "opt-2",
              text: "Questioning assumptions and seeking evidence",
              label: "B",
            },
            {
              id: "opt-3",
              text: "Only consuming familiar sources",
              label: "C",
            },
            { id: "opt-4", text: "Avoiding controversial topics", label: "D" },
          ],
          correctAnswer: "opt-2",
          explanation:
            "Critical thinking involves questioning assumptions and demanding evidence before accepting claims.",
          category: category || "Media Literacy",
          difficulty: difficulty,
        },
        {
          id: "q5",
          question: `What role does context play in understanding media messages?`,
          options: [
            {
              id: "opt-1",
              text: "Context is irrelevant to meaning",
              label: "A",
            },
            {
              id: "opt-2",
              text: "Context determines how information should be interpreted",
              label: "B",
            },
            {
              id: "opt-3",
              text: "Only the literal meaning matters",
              label: "C",
            },
            {
              id: "opt-4",
              text: "Context only applies to written content",
              label: "D",
            },
          ],
          correctAnswer: "opt-2",
          explanation:
            "Context is crucial for accurately interpreting media messages and understanding their intended meaning.",
          category: category || "Media Literacy",
          difficulty: difficulty,
        },
      ],
    };
  }

  /**
   * Build the prompt for OpenAI to generate quiz questions
   */
  private buildQuizPrompt(request: OpenAIQuizRequest): string {
    const { topic, questionCount, difficulty = "medium", category } = request;

    return `Generate ${questionCount} multiple-choice quiz questions about ${topic}.

Requirements:
- Difficulty level: ${difficulty}
- Category: ${category || "General Knowledge"}
- Each question must have 4 options (A, B, C, D)
- One option must be clearly correct
- Include a brief explanation for the correct answer
- Questions should be educational and engaging

Response format (JSON only):
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here",
      "options": [
        {"id": "opt-1", "text": "Option A", "label": "A"},
        {"id": "opt-2", "text": "Option B", "label": "B"},
        {"id": "opt-3", "text": "Option C", "label": "C"},
        {"id": "opt-4", "text": "Option D", "label": "D"}
      ],
      "correctAnswer": "opt-2",
      "explanation": "Brief explanation why this is correct",
      "category": "${category || "General Knowledge"}",
      "difficulty": "${difficulty}"
    }
  ]
}`;
  }

  /**
   * Format and validate the OpenAI response
   */
  private formatQuizResponse(
    response: any,
    request: OpenAIQuizRequest,
  ): OpenAIQuizResponse {
    if (!response.questions || !Array.isArray(response.questions)) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Ensure all questions have required fields
    const questions = response.questions.map((q: any, index: number) => ({
      id: q.id || `q${index + 1}`,
      question: q.question || `Question ${index + 1}`,
      options: Array.isArray(q.options)
        ? q.options.map((opt: any, optIndex: number) => ({
            id: opt.id || `opt-${index + 1}-${optIndex + 1}`,
            text: opt.text || `Option ${optIndex + 1}`,
            label: opt.label || String.fromCharCode(65 + optIndex), // A, B, C, D
          }))
        : [],
      correctAnswer: q.correctAnswer || q.options?.[0]?.id || "",
      explanation: q.explanation || "No explanation provided",
      category: q.category || request.category || "General Knowledge",
      difficulty: q.difficulty || request.difficulty || "medium",
    }));

    return { questions };
  }

  /**
   * Test OpenAI connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: "Hello, this is a test.",
          },
        ],
        max_tokens: 10,
      });
      return !!response.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI connection test failed:", error);
      if (error instanceof OpenAI.APIError) {
        console.error("OpenAI connection test error:", error.message);
      }
      return false;
    }
  }
}

export const openAIService = new OpenAIService();
