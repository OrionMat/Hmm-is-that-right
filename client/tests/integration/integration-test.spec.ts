import { test, expect } from "@playwright/test";
import { mockGetNewsPiecesData } from "./mocks/apiResponses/getNewsPeieces";

test("test", async ({ page }) => {
  // Mocks
  await page.route("**/getNewsPieces?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: mockGetNewsPiecesData,
    });
  });

  // Actions
  await page.goto("/");
  await page.getByRole("link", { name: "Fact Check" }).click();
  await page
    .getByRole("searchbox", { name: "Check a fact or statement" })
    .click();
  await page
    .getByRole("searchbox", { name: "Check a fact or statement" })
    .fill("Test statement");
  await page.keyboard.press("Enter");

  // Assertions
  await expect(
    page.getByRole("searchbox", { name: "Check a fact or statement" }),
  ).toHaveValue("Test statement");
  await expect(
    page.getByRole("link", { name: "BBC News Title" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "NYT News Title" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "\nAP News Title\n" }),
  ).toBeVisible();
  await expect(
    page.getByText("News sentence 1. News sentence 2."),
  ).toBeVisible();
  await expect(page.getByText("News sentence 3.")).toBeVisible();
});
