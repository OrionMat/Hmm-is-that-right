import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../logger.ts");

const { mockAppendFile } = vi.hoisted(() => ({
  mockAppendFile: vi.fn(),
}));

vi.mock("fs", () => ({
  promises: { appendFile: mockAppendFile },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockAppendFile.mockResolvedValue(undefined);
});

import { submitFeedback } from "./submitFeedback";

describe("submitFeedback", () => {
  it("appends a timestamped markdown entry to TODO.md", async () => {
    const before = Date.now();
    await submitFeedback("The brief is too long");
    const after = Date.now();

    expect(mockAppendFile).toHaveBeenCalledOnce();
    const [filePath, content] = mockAppendFile.mock.calls[0];

    expect(filePath).toContain("TODO.md");

    const timestamp = content.match(/## (.+)\n/)?.[1];
    expect(timestamp).toBeDefined();
    const ts = new Date(timestamp).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);

    expect(content).toContain("The brief is too long");
  });

  it("trims whitespace from the feedback text before writing", async () => {
    await submitFeedback("  needs trimming  ");
    const [, content] = mockAppendFile.mock.calls[0];
    expect(content).toContain("needs trimming");
    expect(content).not.toContain("  needs trimming  ");
  });

  it("propagates fs errors to the caller", async () => {
    mockAppendFile.mockRejectedValue(new Error("disk full"));
    await expect(submitFeedback("oops")).rejects.toThrow("disk full");
  });
});
