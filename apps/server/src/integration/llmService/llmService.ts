import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { getLogger } from "../../logger";
import { serverConfig } from "../../config/serverConfig";

const log = getLogger("integration/llmService");

const GEMINI_MODELS = ["gemini-2.0-flash-lite", "gemini-2.5-flash"] as const;

export type SupportedModel =
  | "gemini-2.0-flash-lite"
  | "gemini-2.5-flash"
  | "gpt-4o-mini";

/**
 * Thin abstraction over LLM providers.
 * Routes to Gemini or OpenAI based on the model ID.
 */
class LlmService {
  private geminiClient: GoogleGenerativeAI | null = null;
  private openAiClient: OpenAI | null = null;

  private getGeminiClient(): GoogleGenerativeAI {
    if (!this.geminiClient) {
      if (!serverConfig.geminiApiKey) {
        throw new Error("GEMINI_API_KEY is not configured");
      }
      this.geminiClient = new GoogleGenerativeAI(serverConfig.geminiApiKey);
    }
    return this.geminiClient;
  }

  private getOpenAiClient(): OpenAI {
    if (!this.openAiClient) {
      if (!serverConfig.openAiApiKey) {
        throw new Error("OPENAI_API_KEY is not configured");
      }
      this.openAiClient = new OpenAI({ apiKey: serverConfig.openAiApiKey });
    }
    return this.openAiClient;
  }

  /**
   * Sends a prompt to the specified model and returns the text response.
   * @param prompt The prompt to send
   * @param model The model ID to use
   */
  async complete(prompt: string, model: SupportedModel): Promise<string> {
    log.debug({ model }, "Sending prompt to LLM");

    if ((GEMINI_MODELS as readonly string[]).includes(model)) {
      return this.callGemini(prompt, model);
    }
    if (model === "gpt-4o-mini") {
      return this.callOpenAi(prompt);
    }
    throw new Error(`Unsupported model: ${model}`);
  }

  private async callGemini(prompt: string, model: string): Promise<string> {
    const client = this.getGeminiClient();
    const geminiModel = client.getGenerativeModel({ model });
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();
    log.debug({ model, responseLength: text.length }, "Gemini response received");
    return text;
  }

  private async callOpenAi(prompt: string): Promise<string> {
    const client = this.getOpenAiClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });
    const text = response.choices[0]?.message?.content ?? "";
    log.debug({ responseLength: text.length }, "OpenAI response received");
    return text;
  }
}

export const llmService = new LlmService();
