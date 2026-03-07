import "@testing-library/jest-dom";
import { vi, beforeEach, afterEach } from "vitest";

// Mock SVG imports
vi.mock("*.svg?react", () => ({
  default: () => null,
}));

// Reset mocks before each test and restore after each test
beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
