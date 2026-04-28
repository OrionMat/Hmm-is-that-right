import { test, expect } from "@playwright/test";
import { HAPPY_PATH_SSE_EVENTS, type SseEvent } from "./mocks/apiResponses/morningBrief/happyPath";
import { SECTION_ERROR_SSE_EVENTS } from "./mocks/apiResponses/morningBrief/sectionError";
import { ALL_ERROR_SSE_EVENTS } from "./mocks/apiResponses/morningBrief/allError";
import { CACHE_HIT_SSE_EVENTS } from "./mocks/apiResponses/morningBrief/cacheHit";

function buildSseBody(events: SseEvent[]): string {
  return events
    .map(({ event, data }) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    .join("");
}

const SSE_ROUTE = "**/api/morning-brief/stream*";
const SSE_HEADERS = { "Cache-Control": "no-cache", Connection: "keep-alive" };

test.describe("Morning Brief", () => {
  test("Test 1 — happy path: idle → loading → sections render with content", async ({ page }) => {
    let resolveRoute!: () => void;
    const gate = new Promise<void>((res) => {
      resolveRoute = res;
    });

    await page.route(SSE_ROUTE, async (route) => {
      await gate;
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        headers: SSE_HEADERS,
        body: buildSseBody(HAPPY_PATH_SSE_EVENTS),
      });
    });

    await page.goto("/morning-brief");

    // Idle: button enabled before any interaction
    const button = page.getByRole("button", { name: /get my brief/i });
    await expect(button).toBeEnabled();

    // After click: button is disabled while stream is in flight
    await button.click();
    await expect(page.getByRole("button", { name: /generating/i })).toBeDisabled();

    // Release the gate so the SSE body is delivered
    resolveRoute();

    // All three section headings visible
    await expect(page.getByRole("heading", { name: "World Headlines" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tech & AI" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Long-Form Insight" })).toBeVisible();

    // World and tech items render as links
    await expect(page.getByRole("link", { name: "Global Climate Summit Opens" })).toBeVisible();
    await expect(page.getByRole("link", { name: "UN Security Council Meets" })).toBeVisible();
    await expect(page.getByRole("link", { name: "AI Regulation Bill Advances" })).toBeVisible();
    await expect(page.getByRole("link", { name: "OpenAI Releases New Model" })).toBeVisible();

    // Longform mode badge
    await expect(page.getByText("Zoom Out")).toBeVisible();

    // Accumulated summary text from streaming chunks
    await expect(page.getByText("Global tensions rise.")).toBeVisible();
    await expect(page.getByText("Data centers strain power grids.")).toBeVisible();

    // Button re-enables after done event
    await expect(page.getByRole("button", { name: /get my brief/i })).toBeEnabled();
  });

  test("Test 2 — partial failure: one section errors without blocking the others", async ({
    page,
  }) => {
    await page.route(SSE_ROUTE, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        headers: SSE_HEADERS,
        body: buildSseBody(SECTION_ERROR_SSE_EVENTS),
      });
    });

    await page.goto("/morning-brief");
    await page.getByRole("button", { name: /get my brief/i }).click();

    // World and longform succeed
    await expect(page.getByRole("link", { name: "World Trade Talks Resume" })).toBeVisible();
    await expect(page.getByRole("link", { name: "The Quiet Crisis in Democracy" })).toBeVisible();

    // Tech section shows an error
    await expect(page.getByText("HN API timeout")).toBeVisible();

    // Button re-enables after done
    await expect(page.getByRole("button", { name: /get my brief/i })).toBeEnabled();
  });

  test("Test 3 — all sections error simultaneously", async ({ page }) => {
    await page.route(SSE_ROUTE, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        headers: SSE_HEADERS,
        body: buildSseBody(ALL_ERROR_SSE_EVENTS),
      });
    });

    await page.goto("/morning-brief");
    await page.getByRole("button", { name: /get my brief/i }).click();

    // All three sections show error state
    await expect(page.getByText("Reuters feed unavailable")).toBeVisible();
    await expect(page.getByText("HN API timeout")).toBeVisible();
    await expect(page.getByText("Readability extraction failed")).toBeVisible();

    // No connection error banner — events arrived, this is a data-level failure
    await expect(page.getByText(/connection lost/i)).not.toBeVisible();

    // Button re-enables after done
    await expect(page.getByRole("button", { name: /get my brief/i })).toBeEnabled();
  });

  test("Test 4 — connection failures: network abort and HTTP 429 both show a connection error banner", async ({
    page,
  }) => {
    await test.step("network abort", async () => {
      await page.route(SSE_ROUTE, (route) => route.abort());

      await page.goto("/morning-brief");
      await page.getByRole("button", { name: /get my brief/i }).click();

      await expect(page.getByText(/connection lost/i)).toBeVisible();

      await page.unroute(SSE_ROUTE);
    });

    await test.step("HTTP 429 rate limit", async () => {
      await page.reload();

      await page.route(SSE_ROUTE, async (route) => {
        await route.fulfill({
          status: 429,
          contentType: "application/json",
          body: JSON.stringify({ message: "Request already in flight" }),
        });
      });

      await page.getByRole("button", { name: /get my brief/i }).click();

      await expect(page.getByText(/connection lost/i)).toBeVisible();
    });
  });

  test("Test 5 — cache hit: pre-filled summaries render without streaming chunks", async ({
    page,
  }) => {
    await page.route(SSE_ROUTE, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        headers: SSE_HEADERS,
        body: buildSseBody(CACHE_HIT_SSE_EVENTS),
      });
    });

    await page.goto("/morning-brief");
    await page.getByRole("button", { name: /get my brief/i }).click();

    // Summaries are visible immediately from section_complete data — no chunk events needed
    await expect(
      page.getByText("World leaders gather to negotiate binding emissions targets."),
    ).toBeVisible();
    await expect(
      page.getByText("Senate committee approves landmark AI governance framework."),
    ).toBeVisible();
    await expect(
      page.getByText("Data centers strain power grids as AI compute demand surges."),
    ).toBeVisible();

    // Items render as links
    await expect(page.getByRole("link", { name: "Global Climate Summit Opens" })).toBeVisible();
    await expect(page.getByRole("link", { name: "The Hidden Cost of Data Centers" })).toBeVisible();
  });
});
