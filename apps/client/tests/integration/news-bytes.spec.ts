import { test, expect } from "@playwright/test";
import {
  mockGetHeadlineNewsAllSources,
  mockGetHeadlineNewsGoogleOnly,
} from "./mocks/apiResponses/getHeadlineNews";

test.describe("News Bytes", () => {
  test("fetches and renders summaries for all default-active sources, including Google News Tech", async ({
    page,
  }) => {
    let capturedUrl = "";
    await page.route("**/getHeadlineNews?*", async (route) => {
      capturedUrl = route.request().url();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockGetHeadlineNewsAllSources,
      });
    });

    await page.goto("/");
    await page.getByRole("link", { name: "News Bytes" }).click();

    // Five default-active tiles: BBC, NYT, AP, DeepLearning, GoogleNewsTech
    // (Reuters is disabled and not pressed).
    await expect(page.getByRole("button", { pressed: true })).toHaveCount(5);
    await expect(page.getByText("GOOGL")).toBeVisible();

    await page.getByRole("button", { name: "Go", exact: true }).click();

    // Request contract: all default sources, including googlenewstech, are sent
    expect(capturedUrl).toContain("sources=bbc");
    expect(capturedUrl).toContain("sources=nyt");
    expect(capturedUrl).toContain("sources=ap");
    expect(capturedUrl).toContain("sources=deeplearning");
    expect(capturedUrl).toContain("sources=googlenewstech");

    // Summary card for Google News Tech renders
    await expect(
      page.getByRole("link", { name: "Google News Tech Headline" }),
    ).toBeVisible();
    await expect(page.getByText("Google bullet one.")).toBeVisible();
  });

  test("omits googlenewstech from the request when its tile is toggled off", async ({
    page,
  }) => {
    let capturedUrl = "";
    await page.route("**/getHeadlineNews?*", async (route) => {
      capturedUrl = route.request().url();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockGetHeadlineNewsAllSources,
      });
    });

    await page.goto("/newsBytes");

    await page
      .getByRole("button", { pressed: true })
      .filter({ hasText: "GOOGL" })
      .click();

    await page.getByRole("button", { name: "Go", exact: true }).click();

    expect(capturedUrl).not.toContain("sources=googlenewstech");
    expect(capturedUrl).toContain("sources=bbc");
    expect(capturedUrl).toContain("sources=nyt");
    expect(capturedUrl).toContain("sources=ap");
    expect(capturedUrl).toContain("sources=deeplearning");
  });

  test("requests only googlenewstech when it is the sole active source", async ({
    page,
  }) => {
    let capturedUrl = "";
    await page.route("**/getHeadlineNews?*", async (route) => {
      capturedUrl = route.request().url();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockGetHeadlineNewsGoogleOnly,
      });
    });

    await page.goto("/newsBytes");

    // Deactivate the four other default-active tiles, leaving GOOGL pressed.
    const othersToDeactivate = await page
      .getByRole("button", { pressed: true })
      .filter({ hasNotText: "GOOGL" })
      .count();
    for (let i = 0; i < othersToDeactivate; i++) {
      await page
        .getByRole("button", { pressed: true })
        .filter({ hasNotText: "GOOGL" })
        .first()
        .click();
    }
    await expect(page.getByRole("button", { pressed: true })).toHaveCount(1);

    await page.getByRole("button", { name: "Go", exact: true }).click();

    expect(capturedUrl).toContain("sources=googlenewstech");
    expect(capturedUrl).not.toContain("sources=bbc");
    expect(capturedUrl).not.toContain("sources=nyt");
    expect(capturedUrl).not.toContain("sources=ap");
    expect(capturedUrl).not.toContain("sources=deeplearning");

    await expect(
      page.getByRole("link", { name: "Google News Tech Headline" }),
    ).toBeVisible();
  });
});
