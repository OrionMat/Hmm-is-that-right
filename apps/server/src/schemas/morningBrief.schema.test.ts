import { describe, expect, test } from "vitest";
import { morningBriefQuerySchema } from "./morningBrief.schema";

describe("morningBriefQuerySchema", () => {
  test("query: empty string is rejected", () => {
    const result = morningBriefQuerySchema.safeParse({ query: "" });
    expect(result.success).toBe(false);
  });

  test("query: 201-char string is rejected", () => {
    const result = morningBriefQuerySchema.safeParse({ query: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  test("query: 1-char and 200-char strings are accepted", () => {
    expect(morningBriefQuerySchema.safeParse({ query: "a" }).success).toBe(true);
    expect(morningBriefQuerySchema.safeParse({ query: "a".repeat(200) }).success).toBe(true);
  });

  test("query: whitespace is trimmed before length check", () => {
    const result = morningBriefQuerySchema.safeParse({ query: "  hi  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.query).toBe("hi");
  });

  test("sources: single string is coerced to array", () => {
    const result = morningBriefQuerySchema.safeParse({ sources: "bbc" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.sources).toEqual(["bbc"]);
  });

  test("sources: array of valid sources passes through", () => {
    const result = morningBriefQuerySchema.safeParse({ sources: ["bbc", "ap"] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.sources).toEqual(["bbc", "ap"]);
  });

  test("sources: unknown source is rejected", () => {
    const result = morningBriefQuerySchema.safeParse({ sources: ["bbc", "cnn"] });
    expect(result.success).toBe(false);
  });

  test("sources: empty array is accepted (no toggles enabled)", () => {
    const result = morningBriefQuerySchema.safeParse({ sources: [] });
    expect(result.success).toBe(true);
  });
});
