import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { getLogger } from "../../logger";
import { serverConfig } from "../../config/serverConfig";

const log = getLogger("integration/llmService");

const GEMINI_MODELS = ["gemini-2.0-flash-lite", "gemini-2.5-flash"] as const;
const CLAUDE_MODELS = ["claude-sonnet-4-6"] as const;

export type SupportedModel =
  | "gemini-2.0-flash-lite"
  | "gemini-2.5-flash"
  | "gpt-4o-mini"
  | "claude-sonnet-4-6";

/**
 * Thin abstraction over LLM providers.
 * Routes to Gemini, OpenAI, or Anthropic based on the model ID.
 */
class LlmService {
  private geminiClient: GoogleGenerativeAI | null = null;
  private openAiClient: OpenAI | null = null;
  private anthropicClient: Anthropic | null = null;

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

  private getAnthropicClient(): Anthropic {
    if (!this.anthropicClient) {
      if (!serverConfig.anthropicApiKey) {
        throw new Error("ANTHROPIC_API_KEY is not configured");
      }
      this.anthropicClient = new Anthropic({ apiKey: serverConfig.anthropicApiKey });
    }
    return this.anthropicClient;
  }

  /**
   * Sends a prompt to the specified model and returns the complete text response.
   */
  async complete(prompt: string, model: SupportedModel): Promise<string> {
    log.debug({ model }, "Sending prompt to LLM");

    if ((GEMINI_MODELS as readonly string[]).includes(model)) {
      return this.callGemini(prompt, model);
    }
    if (model === "gpt-4o-mini") {
      return this.callOpenAi(prompt);
    }
    if ((CLAUDE_MODELS as readonly string[]).includes(model)) {
      return this.callClaude(prompt, model);
    }
    throw new Error(`Unsupported model: ${model}`);
  }

  /**
   * Streams a prompt response from the specified model, yielding text deltas.
   * Falls back to yielding the complete response as a single chunk for non-streaming models.
   */
  async *completeStream(prompt: string, model: SupportedModel): AsyncGenerator<string> {
    if ((CLAUDE_MODELS as readonly string[]).includes(model)) {
      yield* this.streamClaude(prompt, model);
      return;
    }
    // Non-streaming fallback: complete() then yield the whole string once
    const text = await this.complete(prompt, model);
    yield text;
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

  private async callClaude(prompt: string, model: string): Promise<string> {
    const client = this.getAnthropicClient();
    const response = await client.messages.create({
      model,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });
    const block = response.content[0];
    const text = block?.type === "text" ? block.text : "";
    log.debug({ model, responseLength: text.length }, "Anthropic response received");
    return text;
  }

  private async *streamClaude(prompt: string, model: string): AsyncGenerator<string> {
    const client = this.getAnthropicClient();
    const stream = await client.messages.create({
      model,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
  }
}

export const llmService = new LlmService();
