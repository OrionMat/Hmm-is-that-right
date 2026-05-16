import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("../logger.ts");

const { mockSubmitFeedback } = vi.hoisted(() => ({
  mockSubmitFeedback: vi.fn(),
}));

vi.mock("../service/morningBrief/submitFeedback", () => ({
  submitFeedback: mockSubmitFeedback,
}));

// Suppress openAIService init side-effect
vi.mock("../integration/openAIService", () => ({
  openAIService: { generateQuizQuestions: vi.fn() },
}));

import { app } from "../app";

beforeEach(() => {
  vi.clearAllMocks();
  mockSubmitFeedback.mockResolvedValue(undefined);
});

describe("POST /api/morning-brief/feedback", () => {
  it("returns 200 and success:true for a valid body", async () => {
    const res = await request(app)
      .post("/api/morning-brief/feedback")
      .send({ text: "Great brief today!" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(mockSubmitFeedback).toHaveBeenCalledOnce();
    expect(mockSubmitFeedback).toHaveBeenCalledWith("Great brief today!");
  });

  it("returns 400 when text is missing", async () => {
    const res = await request(app)
      .post("/api/morning-brief/feedback")
      .send({});

    expect(res.status).toBe(400);
    expect(mockSubmitFeedback).not.toHaveBeenCalled();
  });

  it("returns 400 when text is empty string", async () => {
    const res = await request(app)
      .post("/api/morning-brief/feedback")
      .send({ text: "" });

    expect(res.status).toBe(400);
    expect(mockSubmitFeedback).not.toHaveBeenCalled();
  });

  it("returns 400 when text is whitespace only", async () => {
    const res = await request(app)
      .post("/api/morning-brief/feedback")
      .send({ text: "   " });

    expect(res.status).toBe(400);
    expect(mockSubmitFeedback).not.toHaveBeenCalled();
  });

  it("returns 500 when the service throws", async () => {
    mockSubmitFeedback.mockRejectedValue(new Error("disk full"));

    const res = await request(app)
      .post("/api/morning-brief/feedback")
      .send({ text: "Some feedback" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to save feedback" });
  });
});
