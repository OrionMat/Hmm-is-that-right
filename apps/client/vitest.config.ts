import { defineConfig, Plugin } from "vitest/config";

// Replace all *.svg?react imports with a null component so that jsdom never
// tries to create DOM elements from raw SVG data URIs.
const svgMockPlugin: Plugin = {
  name: "svg-react-mock",
  transform(_code, id) {
    if (id.includes(".svg") && id.includes("react")) {
      return { code: "export default function SvgMock() { return null; }" };
    }
  },
};

export default defineConfig({
  plugins: [svgMockPlugin],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: false,
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", "tests"],
  },
});
