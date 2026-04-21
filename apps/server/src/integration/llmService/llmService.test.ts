import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../logger.ts");

// vi.hoisted runs before vi.mock — define everything mock factories reference here
const {
  mockServerConfig,
  mockGenerateContent,
  mockGetGenerativeModel,
  mockChatCreate,
  mockAnthropicCreate,
} = vi.hoisted(() => {
  const mockGenerateContent = vi.fn();
  const mockGetGenerativeModel = vi.fn(() => ({ generateContent: mockGenerateContent }));
  const mockChatCreate = vi.fn();
  const mockAnthropicCreate = vi.fn();
  const mockServerConfig = {
    geminiApiKey: "test-gemini-key" as string | undefined,
    openAiApiKey: "test-openai-key" as string | undefined,
    anthropicApiKey: "test-anthropic-key" as string | undefined,
  };
  return {
    mockServerConfig,
    mockGenerateContent,
    mockGetGenerativeModel,
    mockChatCreate,
    mockAnthropicCreate,
  };
});

// Regular functions (not arrow functions) so `new ClassName()` works correctly
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(function () {
    return { getGenerativeModel: mockGetGenerativeModel };
  }),
}));

vi.mock("openai", () => ({
  default: vi.fn(function () {
    return { chat: { completions: { create: mockChatCreate } } };
  }),
}));

vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn(function () {
    return { messages: { create: mockAnthropicCreate } };
  }),
}));

vi.mock("../../config/serverConfig", () => ({ serverConfig: mockServerConfig }));

import { llmService } from "./llmService";

beforeEach(() => {
  vi.clearAllMocks();
  // Reset lazy-initialized clients between tests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (llmService as any).geminiClient = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (llmService as any).openAiClient = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (llmService as any).anthropicClient = null;
  mockServerConfig.geminiApiKey = "test-gemini-key";
  mockServerConfig.openAiApiKey = "test-openai-key";
  mockServerConfig.anthropicApiKey = "test-anthropic-key";
});

describe("LlmService", () => {
  it("routes gemini-2.0-flash-lite to the Gemini SDK and returns text", async () => {
    mockGenerateContent.mockResolvedValue({ response: { text: () => "gemini output" } });

    const result = await llmService.complete("hello", "gemini-2.0-flash-lite");

    expect(mockGetGenerativeModel).toHaveBeenCalledWith({ model: "gemini-2.0-flash-lite" });
    expect(result).toBe("gemini output");
  });

  it("routes gpt-4o-mini to the OpenAI SDK and returns text", async () => {
    mockChatCreate.mockResolvedValue({
      choices: [{ message: { content: "openai output" } }],
    });

    const result = await llmService.complete("hello", "gpt-4o-mini");

    expect(mockChatCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: "gpt-4o-mini" }),
      { signal: undefined },
    );
    expect(result).toBe("openai output");
  });

  it("throws for an unsupported model", async () => {
    await expect(
      // @ts-expect-error — intentionally passing invalid model
      llmService.complete("hello", "unknown-model")
    ).rejects.toThrow("Unsupported model: unknown-model");
  });

  it("throws when GEMINI_API_KEY is not configured", async () => {
    mockServerConfig.geminiApiKey = undefined;

    await expect(llmService.complete("hello", "gemini-2.0-flash-lite")).rejects.toThrow(
      "GEMINI_API_KEY is not configured"
    );
  });

  it("throws when OPENAI_API_KEY is not configured", async () => {
    mockServerConfig.openAiApiKey = undefined;

    await expect(llmService.complete("hello", "gpt-4o-mini")).rejects.toThrow(
      "OPENAI_API_KEY is not configured"
    );
  });

  it("routes claude-sonnet-4-6 to the Anthropic SDK and returns text", async () => {
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: "text", text: "claude output" }],
    });

    const result = await llmService.complete("hello", "claude-sonnet-4-6");

    expect(mockAnthropicCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: "claude-sonnet-4-6" }),
      { signal: undefined },
    );
    expect(result).toBe("claude output");
  });

  it("throws when ANTHROPIC_API_KEY is not configured", async () => {
    mockServerConfig.anthropicApiKey = undefined;

    await expect(llmService.complete("hello", "claude-sonnet-4-6")).rejects.toThrow(
      "ANTHROPIC_API_KEY is not configured"
    );
  });

  it("completeStream yields the full text as one chunk for non-Claude models", async () => {
    mockGenerateContent.mockResolvedValue({ response: { text: () => "streamed output" } });

    const chunks: string[] = [];
    for await (const chunk of llmService.completeStream("hello", "gemini-2.0-flash-lite")) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(["streamed output"]);
  });

  it("completeStream yields text deltas from Anthropic for Claude models", async () => {
    const fakeStream = (async function* () {
      yield { type: "content_block_delta", delta: { type: "text_delta", text: "hello " } };
      yield { type: "content_block_delta", delta: { type: "text_delta", text: "world" } };
      yield { type: "message_stop" };
    })();
    mockAnthropicCreate.mockResolvedValue(fakeStream);

    const chunks: string[] = [];
    for await (const chunk of llmService.completeStream("hello", "claude-sonnet-4-6")) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(["hello ", "world"]);
  });
});
