import { test, expect, Page } from "@playwright/test";
import { mockQuizQuestions } from "./mocks/apiResponses/quizQuestions";

async function setupDefaultRoute(page: Page) {
  await page.route("**/api/quiz/questions", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: mockQuizQuestions,
    });
  });
}

async function navigateToAcademics(page: Page) {
  await page.goto("/");
  await page.getByRole("link", { name: "Academics" }).click();
}

async function answerAllQuestions(page: Page) {
  await page.locator("label").filter({ hasText: "Three" }).click(); // Q1 wrong
  await page.clock.fastForward(800);
  await page.locator("label").filter({ hasText: "Blue" }).click(); // Q2 correct
  await page.clock.fastForward(800);
  await page.locator("label").filter({ hasText: "Paris" }).click(); // Q3 correct
  await page.clock.fastForward(800);
}

test.describe("Academics quiz", () => {
  test("shows a loading spinner while questions are fetching", async ({
    page,
  }) => {
    // Use a deferred promise so we control exactly when the API responds,
    // giving the spinner time to appear before it resolves.
    let resolveRequest!: () => void;
    const requestPending = new Promise<void>((resolve) => {
      resolveRequest = resolve;
    });

    await page.route("**/api/quiz/questions", async (route) => {
      await requestPending;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockQuizQuestions,
      });
    });

    await page.clock.install();
    await navigateToAcademics(page);

    await expect(page.getByRole("status", { name: "Loading" })).toBeVisible();

    resolveRequest();

    await expect(page.getByText("What is 2+2?")).toBeVisible();
    await expect(page.getByRole("status")).not.toBeVisible();
  });

  test("renders the first question once loaded and hides the spinner", async ({
    page,
  }) => {
    await setupDefaultRoute(page);
    await page.clock.install();
    await navigateToAcademics(page);

    await expect(page.getByText("What is 2+2?")).toBeVisible();
    await expect(page.getByText("Question 1 of 3")).toBeVisible();
    await expect(page.getByRole("status")).not.toBeVisible();
  });

  test("clicking through all questions with mixed answers shows correct results", async ({
    page,
  }) => {
    await setupDefaultRoute(page);
    await page.clock.install();
    await navigateToAcademics(page);

    // --- Q1: answer incorrectly (Three — correct is Four) ---
    await expect(page.getByText("What is 2+2?")).toBeVisible();
    await page.locator("label").filter({ hasText: "Three" }).click();
    await page.clock.fastForward(800);

    // --- Q2: answer correctly (Blue) ---
    await expect(page.getByText("Question 2 of 3")).toBeVisible();
    await expect(page.getByText("What color is the sky?")).toBeVisible();
    await page.locator("label").filter({ hasText: "Blue" }).click();
    await page.clock.fastForward(800);

    // --- Q3: answer correctly (Paris) ---
    await expect(page.getByText("Question 3 of 3")).toBeVisible();
    await expect(page.getByText("What is the capital of France?")).toBeVisible();
    await page.locator("label").filter({ hasText: "Paris" }).click();
    await page.clock.fastForward(800);

    // --- Results: score summary ---
    await expect(page.getByText("Quiz Complete!")).toBeVisible();
    await expect(page.getByText("67%")).toBeVisible();
    await expect(
      page.getByText("You got 2 out of 3 questions correct"),
    ).toBeVisible();

    // --- Results: stats cards ---
    await expect(page.getByText("Total Questions")).toBeVisible();
    await expect(page.getByText("Correct Answers")).toBeVisible();
    await expect(page.getByText("Time Spent")).toBeVisible();

    // --- Results: wrong answer review (Q1) ---
    // Shows ✗, the user's wrong answer, the correct answer, and the explanation
    await expect(page.getByText(/✗ Question 1:/)).toBeVisible();
    await expect(page.getByText("Correct answer:")).toBeVisible();
    await expect(page.getByText("Four")).toBeVisible();
    await expect(page.getByText("2+2 equals 4, not 3.")).toBeVisible();

    // --- Results: correct answer reviews (Q2, Q3) ---
    // Shows ✓ and no "Correct answer:" label for these
    await expect(page.getByText(/✓ Question 2:/)).toBeVisible();
    await expect(page.getByText(/✓ Question 3:/)).toBeVisible();
  });

  test("shows an error message if the API call fails", async ({ page }) => {
    await page.route("**/api/quiz/questions", async (route) => {
      await route.fulfill({ status: 500 });
    });

    await page.clock.install();
    await navigateToAcademics(page);

    await expect(page.getByText("Something went wrong")).toBeVisible();
    await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();
  });

  test("restarting from the results page re-fetches questions", async ({
    page,
  }) => {
    await setupDefaultRoute(page);
    await page.clock.install();
    await navigateToAcademics(page);

    await expect(page.getByText("What is 2+2?")).toBeVisible();
    await answerAllQuestions(page);
    await expect(page.getByText("Quiz Complete!")).toBeVisible();

    // Wait for the restart request to fire before asserting the new question
    const restartRequest = page.waitForRequest("**/api/quiz/questions");
    await page.getByRole("button", { name: "Start New Quiz" }).click();
    await restartRequest;

    await expect(page.getByText("What is 2+2?")).toBeVisible();
  });
});
