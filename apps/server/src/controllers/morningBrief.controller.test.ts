import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("../logger.ts");

const { mockBuildSection, mockPersonalContext, mockServerConfig } = vi.hoisted(() => {
  const mockBuildSection = vi.fn();
  const mockPersonalContext = "## Current Role\nSenior engineer";
  const mockServerConfig = { morningBriefCacheTtlMs: 3600000 };
  return { mockBuildSection, mockPersonalContext, mockServerConfig };
});

vi.mock("../service/morningBrief/buildSection", () => ({ buildSection: mockBuildSection }));
vi.mock("../service/morningBrief/personalContext", () => ({
  personalContext: mockPersonalContext,
}));
vi.mock("../config/serverConfig", () => ({ serverConfig: mockServerConfig }));
vi.mock("../service/morningBrief/sectionSpecs", () => ({
  worldSpec: () => ({ section: "world", n: 2, fetchCandidates: vi.fn() }),
  techSpec: () => ({ section: "tech", n: 2, fetchCandidates: vi.fn() }),
  longformSpec: () => ({ section: "longform", mode: "zoom-in", n: 1, fetchCandidates: vi.fn() }),
}));
vi.mock("../service/morningBrief/cache", () => ({
  cacheKey: vi.fn(() => "test-key"),
  cacheGet: vi.fn(() => undefined),
  cacheSet: vi.fn(),
}));
vi.mock("../service/morningBrief/modeRotation", () => ({
  getModeForDate: vi.fn(() => "zoom-in"),
}));

// The quiz route's openAIService initialises OpenAI at import time — mock it out
vi.mock("../integration/openAIService", () => ({
  openAIService: { generateQuizQuestions: vi.fn() },
}));

import { app } from "../app";

const WORLD_PAYLOAD = {
  section: "world",
  items: [{ title: "Big Story", url: "https://example.com", source: "bbc", summary: "It happened." }],
  generatedAt: "2026-04-21T08:00:00.000Z",
};
const TECH_PAYLOAD = {
  section: "tech",
  items: [{ title: "AI News", url: "https://ai.com", source: "hackernews", summary: "Big move." }],
  generatedAt: "2026-04-21T08:00:00.000Z",
};

function diagnosticsFor(section: string) {
  return {
    section,
    cacheHit: false,
    llmModel: "claude-sonnet-4-6",
    selectionMethod: "llm",
    personalContextUsed: true,
    sources: [],
    candidates: [],
    scrapes: [],
    durations: { fetchCandidatesMs: 0, selectionMs: 0, scrapingMs: 0, summarisationMs: 0, totalMs: 0 },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockBuildSection
    .mockResolvedValueOnce({ payload: WORLD_PAYLOAD, diagnostics: diagnosticsFor("world") })
    .mockResolvedValueOnce({ payload: TECH_PAYLOAD, diagnostics: diagnosticsFor("tech") })
    .mockRejectedValueOnce(new Error("LLM timeout")); // longform fails
});

describe("GET /api/morning-brief/stream", () => {
  it("returns text/event-stream content type", async () => {
    const res = await request(app)
      .get("/api/morning-brief/stream")
      .buffer(true)
      .parse((res, callback) => {
        let data = "";
        res.on("data", (chunk: Buffer) => (data += chunk.toString()));
        res.on("end", () => callback(null, data));
      });

    expect(res.headers["content-type"]).toMatch(/text\/event-stream/);
  });

  it("emits section_start events at the beginning", async () => {
    const res = await request(app)
      .get("/api/morning-brief/stream")
      .buffer(true)
      .parse((res, callback) => {
        let data = "";
        res.on("data", (chunk: Buffer) => (data += chunk.toString()));
        res.on("end", () => callback(null, data));
      });

    const body = res.body as string;
    expect(body).toContain("event: section_start");
  });

  it("emits section_complete for successful sections", async () => {
    const res = await request(app)
      .get("/api/morning-brief/stream")
      .buffer(true)
      .parse((res, callback) => {
        let data = "";
        res.on("data", (chunk: Buffer) => (data += chunk.toString()));
        res.on("end", () => callback(null, data));
      });

    const body = res.body as string;
    expect(body).toContain("event: section_complete");
    expect(body).toContain('"section":"world"');
    expect(body).toContain('"section":"tech"');
  });

  it("emits section_error for the failing section without blocking others", async () => {
    const res = await request(app)
      .get("/api/morning-brief/stream")
      .buffer(true)
      .parse((res, callback) => {
        let data = "";
        res.on("data", (chunk: Buffer) => (data += chunk.toString()));
        res.on("end", () => callback(null, data));
      });

    const body = res.body as string;
    expect(body).toContain("event: section_error");
    expect(body).toContain('"section":"longform"');
    // Other sections still completed
    expect(body).toContain('"section":"world"');
  });

  it("emits section_diagnostics for successful sections", async () => {
    const res = await request(app)
      .get("/api/morning-brief/stream")
      .buffer(true)
      .parse((res, callback) => {
        let data = "";
        res.on("data", (chunk: Buffer) => (data += chunk.toString()));
        res.on("end", () => callback(null, data));
      });

    const body = res.body as string;
    expect(body).toContain("event: section_diagnostics");
    expect(body).toContain('"llmModel":"claude-sonnet-4-6"');
    expect(body).toContain('"selectionMethod":"llm"');
  });

  it("emits done at the end", async () => {
    const res = await request(app)
      .get("/api/morning-brief/stream")
      .buffer(true)
      .parse((res, callback) => {
        let data = "";
        res.on("data", (chunk: Buffer) => (data += chunk.toString()));
        res.on("end", () => callback(null, data));
      });

    expect((res.body as string)).toContain("event: done");
  });

  it("returns 400 for an invalid date param", async () => {
    const res = await request(app).get("/api/morning-brief/stream?date=not-a-date");
    expect(res.status).toBe(400);
  });
});
