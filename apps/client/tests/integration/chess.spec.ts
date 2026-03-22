import { test, expect, Page } from "@playwright/test";

async function navigateToChess(page: Page) {
  await page.goto("/");
  await page.getByRole("link", { name: "Academics" }).click();
  await page.getByRole("link", { name: "Chess" }).click();
}

test.describe("Chess", () => {
  test("navigating via hub shows the chess board", async ({ page }) => {
    await navigateToChess(page);

    await expect(page.locator(".chess-board, [data-testid='chessboard'], svg").first()).toBeVisible();
    await expect(page.getByText("White's turn")).toBeVisible();
    await expect(page.getByText("Move History")).toBeVisible();
    await expect(page.getByRole("button", { name: "New Game" })).toBeVisible();
  });

  test("academics hub shows quiz and chess options", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Academics" }).click();

    await expect(page.getByRole("link", { name: "Quiz" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Chess" })).toBeVisible();
    await expect(page.getByText("Academics")).toBeVisible();
  });

  test("new game button resets the board", async ({ page }) => {
    await navigateToChess(page);

    await expect(page.getByText("White's turn")).toBeVisible();

    await page.getByRole("button", { name: "New Game" }).click();

    await expect(page.getByText("White's turn")).toBeVisible();
    await expect(page.getByText("No moves yet")).toBeVisible();
  });

  test("resign button shows game over banner for the resigning side", async ({ page }) => {
    await navigateToChess(page);

    await page.getByRole("button", { name: "Resign" }).click();

    await expect(page.getByText("Game Over")).toBeVisible();
    await expect(page.getByRole("button", { name: "Play Again" })).toBeVisible();
  });

  test("play again from game over banner resets to a new game", async ({ page }) => {
    await navigateToChess(page);

    await page.getByRole("button", { name: "Resign" }).click();
    await expect(page.getByText("Game Over")).toBeVisible();

    await page.getByRole("button", { name: "Play Again" }).click();

    await expect(page.getByText("White's turn")).toBeVisible();
    await expect(page.getByText("No moves yet")).toBeVisible();
  });

  test("flip board button is visible", async ({ page }) => {
    await navigateToChess(page);

    await expect(page.getByRole("button", { name: "Flip Board" })).toBeVisible();
  });
});
