import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../logger.ts");

// vi.hoisted runs before vi.mock — define everything mock factories reference here
const { mockServerConfig, mockGenerateContent, mockGetGenerativeModel, mockChatCreate } =
  vi.hoisted(() => {
    const mockGenerateContent = vi.fn();
    const mockGetGenerativeModel = vi.fn(() => ({ generateContent: mockGenerateContent }));
    const mockChatCreate = vi.fn();
    const mockServerConfig = {
      geminiApiKey: "test-gemini-key" as string | undefined,
      openAiApiKey: "test-openai-key" as string | undefined,
    };
    return { mockServerConfig, mockGenerateContent, mockGetGenerativeModel, mockChatCreate };
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

vi.mock("../../config/serverConfig", () => ({ serverConfig: mockServerConfig }));

import { llmService } from "./llmService";

beforeEach(() => {
  vi.clearAllMocks();
  // Reset lazy-initialized clients between tests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (llmService as any).geminiClient = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (llmService as any).openAiClient = null;
  mockServerConfig.geminiApiKey = "test-gemini-key";
  mockServerConfig.openAiApiKey = "test-openai-key";
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
      expect.objectContaining({ model: "gpt-4o-mini" })
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
});
