import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Fact Check" }).click();

  await page
    .getByRole("searchbox", { name: "Check a fact or statement" })
    .click();
  await page
    .getByRole("searchbox", { name: "Check a fact or statement" })
    .fill("Hello");
  await page.getByRole("button").first().click();

  await expect(
    page.getByRole("searchbox", { name: "Check a fact or statement" }),
  ).toHaveValue("Hello");
});
