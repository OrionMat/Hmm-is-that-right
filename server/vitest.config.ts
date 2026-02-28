import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["src/**/*.test.ts"],
    exclude: ["build/**", "dist/**", "node_modules/**"],
    clearMocks: true,
  },
});
