import "@testing-library/jest-dom";
import { vi, beforeEach, afterEach } from "vitest";

// SVG imports (*.svg?react) are intercepted at the Vite plugin level in
// vitest.config.ts and replaced with a null component, so no vi.mock is needed here.

// Reset mocks before each test and restore after each test
beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
