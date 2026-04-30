import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MorningBrief } from "./MorningBrief";
import * as streamService from "../../service/morningBriefStream";
import { MorningBriefHandlers } from "../../service/morningBriefStream";

vi.mock("../../service/morningBriefStream");

let capturedHandlers: MorningBriefHandlers | null = null;

beforeEach(() => {
  capturedHandlers = null;
  vi.mocked(streamService.subscribeMorningBrief).mockImplementation((handlers) => {
    capturedHandlers = handlers;
    return () => {};
  });
});

describe("MorningBrief", () => {
  it("renders the page with a button", () => {
    render(<MorningBrief />);
    expect(screen.getByRole("button", { name: /get my brief/i })).toBeInTheDocument();
    expect(screen.getByText("Morning Brief")).toBeInTheDocument();
  });

  it("shows loading state for all sections after clicking the button", async () => {
    render(<MorningBrief />);
    fireEvent.click(screen.getByRole("button", { name: /get my brief/i }));

    expect(screen.getByText("World Headlines")).toBeInTheDocument();
    expect(screen.getByText("Tech & AI")).toBeInTheDocument();
    expect(screen.getByText("Long-Form Insight")).toBeInTheDocument();
  });

  it("renders section content when section_complete fires", async () => {
    render(<MorningBrief />);
    fireEvent.click(screen.getByRole("button", { name: /get my brief/i }));

    capturedHandlers!.onSectionComplete({
      section: "world",
      items: [
        { title: "Major World Event", url: "https://bbc.co.uk/1", source: "bbc", summary: "It happened today." },
      ],
      generatedAt: "2026-04-21T08:00:00Z",
    });

    await waitFor(() => {
      expect(screen.getByText("Major World Event")).toBeInTheDocument();
      expect(screen.getByText("It happened today.")).toBeInTheDocument();
    });
  });

  it("shows per-section error without affecting other sections", async () => {
    render(<MorningBrief />);
    fireEvent.click(screen.getByRole("button", { name: /get my brief/i }));

    capturedHandlers!.onSectionComplete({
      section: "world",
      items: [{ title: "World Story", url: "https://bbc.co.uk/1", source: "bbc", summary: "Summary here." }],
      generatedAt: "2026-04-21T08:00:00Z",
    });
    capturedHandlers!.onSectionError("tech", "LLM timeout");

    await waitFor(() => {
      expect(screen.getByText("World Story")).toBeInTheDocument();
      expect(screen.getByText("LLM timeout")).toBeInTheDocument();
    });
  });

  it("re-enables the button and hides spinner after done fires", async () => {
    render(<MorningBrief />);
    fireEvent.click(screen.getByRole("button", { name: /get my brief/i }));

    expect(screen.getByRole("button")).toBeDisabled();

    capturedHandlers!.onDone();

    await waitFor(() => {
      expect(screen.getByRole("button")).not.toBeDisabled();
    });
  });

  it("shows a connection error message if the stream fails", async () => {
    render(<MorningBrief />);
    fireEvent.click(screen.getByRole("button", { name: /get my brief/i }));

    capturedHandlers!.onConnectionError();

    await waitFor(() => {
      expect(screen.getByText(/connection lost/i)).toBeInTheDocument();
    });
  });

  it("renders the Behind the scenes panel after section_diagnostics arrives", async () => {
    render(<MorningBrief />);
    fireEvent.click(screen.getByRole("button", { name: /get my brief/i }));

    capturedHandlers!.onSectionDiagnostics!({
      section: "world",
      cacheHit: false,
      llmModel: "claude-sonnet-4-6",
      selectionMethod: "llm",
      personalContextUsed: true,
      sources: [
        { source: "bbc", kind: "rss", status: "ok", articlesReturned: 3 },
        { source: "ap", kind: "rss", status: "failed", articlesReturned: 0, error: "timeout" },
      ],
      candidates: [
        {
          id: "c1",
          title: "Considered headline A",
          source: "bbc",
          url: "https://bbc.co.uk/a",
          picked: true,
        },
        {
          id: "c2",
          title: "Considered headline B",
          source: "ap",
          url: "https://apnews.com/b",
          picked: false,
        },
      ],
      scrapes: [
        {
          url: "https://bbc.co.uk/a",
          title: "Considered headline A",
          source: "bbc",
          outcome: "scraped",
          contentChars: 1234,
        },
      ],
      durations: {
        fetchCandidatesMs: 100,
        selectionMs: 200,
        scrapingMs: 300,
        summarisationMs: 400,
        totalMs: 1000,
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/Behind the scenes/i)).toBeInTheDocument();
      // Picked headline appears in candidates list and scrape list
      expect(screen.getAllByText("Considered headline A").length).toBeGreaterThan(0);
      expect(screen.getByText("Considered headline B")).toBeInTheDocument();
      // Failed source surfaces its error
      expect(screen.getByText(/timeout/i)).toBeInTheDocument();
      // Selection method line
      expect(screen.getByText(/Selection: LLM/i)).toBeInTheDocument();
    });
  });

  it("appends streaming summary chunks to the matching item by url", async () => {
    render(<MorningBrief />);
    fireEvent.click(screen.getByRole("button", { name: /get my brief/i }));

    // Server sends section_complete with empty summaries (skeleton)
    capturedHandlers!.onSectionComplete({
      section: "world",
      items: [
        { title: "Story A", url: "https://bbc.co.uk/a", source: "bbc", summary: "" },
        { title: "Story B", url: "https://reuters.com/b", source: "reuters", summary: "" },
      ],
      generatedAt: "2026-04-21T08:00:00Z",
    });

    await waitFor(() => {
      expect(screen.getByText("Story A")).toBeInTheDocument();
      expect(screen.getByText("Story B")).toBeInTheDocument();
    });

    // Stream chunks for Story A
    capturedHandlers!.onSummaryChunk!({ section: "world", url: "https://bbc.co.uk/a", delta: "Hello " });
    capturedHandlers!.onSummaryChunk!({ section: "world", url: "https://bbc.co.uk/a", delta: "world." });

    // And one chunk for Story B (interleaved is fine)
    capturedHandlers!.onSummaryChunk!({ section: "world", url: "https://reuters.com/b", delta: "Other story." });

    await waitFor(() => {
      expect(screen.getByText("Hello world.")).toBeInTheDocument();
      expect(screen.getByText("Other story.")).toBeInTheDocument();
    });
  });
});
