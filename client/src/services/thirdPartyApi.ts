// Generic third-party API service for quiz question generation
// This could integrate with OpenAI, ChatGPT, Claude, or other AI providers

export interface ThirdPartyQuestion {
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
}

export interface ThirdPartyApiConfig {
  provider: "openai" | "anthropic" | "google" | "custom";
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export interface GenerateQuizRequest {
  topic: string;
  questionCount: number;
  difficulty?: "easy" | "medium" | "hard";
  category?: string;
}

export class ThirdPartyApiService {
  private config: ThirdPartyApiConfig;

  constructor(config: ThirdPartyApiConfig) {
    this.config = config;
  }

  /**
   * Generate quiz questions using third-party AI service
   */
  async generateQuizQuestions(
    request: GenerateQuizRequest,
  ): Promise<ThirdPartyQuestion[]> {
    try {
      // In a real implementation, this would make actual API calls
      // For now, we'll simulate the response with hardcoded questions
      return await this.mockApiCall(request);
    } catch (error) {
      throw new Error(`Failed to generate quiz questions: ${error}`);
    }
  }

  /**
   * Mock API call that simulates third-party response
   * In production, this would be replaced with actual API calls to:
   * - OpenAI API (GPT-4, GPT-3.5)
   * - Anthropic API (Claude)
   * - Google API (Gemini)
   * - Custom AI service
   */
  private async mockApiCall(
    request: GenerateQuizRequest,
  ): Promise<ThirdPartyQuestion[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock response from third-party service
    return [
      {
        id: "ai-gen-1",
        question:
          "Which of the following is the most reliable indicator of factual accuracy in online news?",
        options: [
          {
            id: "opt-1",
            text: "The article has been shared by many people",
            label: "A",
          },
          {
            id: "opt-2",
            text: "The source cites multiple credible sources",
            label: "B",
          },
          {
            id: "opt-3",
            text: "The headline is emotionally engaging",
            label: "C",
          },
          { id: "opt-4", text: "The article has recent comments", label: "D" },
        ],
        correctAnswer: "opt-2",
        explanation:
          "Citing multiple credible sources is the strongest indicator of factual accuracy, as it demonstrates research and verification.",
        category: "Media Literacy",
        difficulty: "medium",
      },
      {
        id: "ai-gen-2",
        question: "What is the primary purpose of fact-checking organizations?",
        options: [
          {
            id: "opt-1",
            text: "To promote specific political viewpoints",
            label: "A",
          },
          {
            id: "opt-2",
            text: "To verify the accuracy of claims and statements",
            label: "B",
          },
          { id: "opt-3", text: "To increase website traffic", label: "C" },
          { id: "opt-4", text: "To entertain readers", label: "D" },
        ],
        correctAnswer: "opt-2",
        explanation:
          "Fact-checking organizations exist to verify the accuracy of claims and statements, helping the public distinguish between truth and misinformation.",
        category: "Media Literacy",
        difficulty: "easy",
      },
      {
        id: "ai-gen-3",
        question: "Which of these red flags suggests potential misinformation?",
        options: [
          { id: "opt-1", text: "Multiple sources are cited", label: "A" },
          {
            id: "opt-2",
            text: "The author is identified and has credentials",
            label: "B",
          },
          {
            id: "opt-3",
            text: "The article uses overly emotional language",
            label: "C",
          },
          { id: "opt-4", text: "The content is balanced and fair", label: "D" },
        ],
        correctAnswer: "opt-3",
        explanation:
          "Overly emotional language is a common red flag for misinformation, as it often aims to manipulate feelings rather than present facts objectively.",
        category: "Critical Thinking",
        difficulty: "medium",
      },
      {
        id: "ai-gen-4",
        question:
          "What is the best first step when encountering a suspicious claim online?",
        options: [
          {
            id: "opt-1",
            text: "Share it immediately to warn others",
            label: "A",
          },
          {
            id: "opt-2",
            text: "Check the source and look for supporting evidence",
            label: "B",
          },
          {
            id: "opt-3",
            text: "Assume it's true if it aligns with your beliefs",
            label: "C",
          },
          { id: "opt-4", text: "Ignore it completely", label: "D" },
        ],
        correctAnswer: "opt-2",
        explanation:
          "The best first step is to check the source and look for supporting evidence, as this helps determine credibility before taking any action.",
        category: "Media Literacy",
        difficulty: "easy",
      },
      {
        id: "ai-gen-5",
        question:
          'How does the "backfire effect" impact fact-checking efforts?',
        options: [
          {
            id: "opt-1",
            text: "It makes people more likely to accept corrections",
            label: "A",
          },
          {
            id: "opt-2",
            text: "It can strengthen false beliefs when challenged",
            label: "B",
          },
          {
            id: "opt-3",
            text: "It has no effect on people's beliefs",
            label: "C",
          },
          {
            id: "opt-4",
            text: "It only affects people with low education",
            label: "D",
          },
        ],
        correctAnswer: "opt-2",
        explanation:
          "The backfire effect occurs when corrections actually strengthen false beliefs, especially when identity or emotions are involved.",
        category: "Psychology",
        difficulty: "hard",
      },
    ];
  }

  /**
   * Example of how this would integrate with actual APIs:
   *
   * OpenAI Integration:
   * ```typescript
   * private async callOpenAI(request: GenerateQuizRequest): Promise<ThirdPartyQuestion[]> {
   *   const response = await fetch('https://api.openai.com/v1/chat/completions', {
   *     method: 'POST',
   *     headers: {
   *       'Authorization': `Bearer ${this.config.apiKey}`,
   *       'Content-Type': 'application/json',
   *     },
   *     body: JSON.stringify({
   *       model: this.config.model || 'gpt-4',
   *       messages: [{
   *         role: 'system',
   *         content: `Generate ${request.questionCount} quiz questions about ${request.topic}...`
   *       }]
   *     })
   *   });
   *   return this.parseOpenAIResponse(response);
   * }
   * ```
   *
   * Claude Integration:
   * ```typescript
   * private async callClaude(request: GenerateQuizRequest): Promise<ThirdPartyQuestion[]> {
   *   const response = await fetch('https://api.anthropic.com/v1/messages', {
   *     method: 'POST',
   *     headers: {
   *       'x-api-key': this.config.apiKey,
   *       'Content-Type': 'application/json',
   *     },
   *     body: JSON.stringify({
   *       model: this.config.model || 'claude-3-sonnet-20240229',
   *       max_tokens: 4000,
   *       messages: [{
   *         role: 'user',
   *         content: `Generate ${request.questionCount} quiz questions about ${request.topic}...`
   *       }]
   *     })
   *   });
   *   return this.parseClaudeResponse(response);
   * }
   * ```
   */
}

// Factory function to create API service instances
export function createThirdPartyApiService(
  config: ThirdPartyApiConfig,
): ThirdPartyApiService {
  return new ThirdPartyApiService(config);
}

// Default configuration for development
export const DEFAULT_API_CONFIG: ThirdPartyApiConfig = {
  provider: "openai",
  model: "gpt-4",
  // In production, API key should come from environment variables
  // Note: For Vite, use import.meta.env instead of process.env
  apiKey: import.meta.env.VITE_THIRD_PARTY_API_KEY,
};
