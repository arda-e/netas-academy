import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["**/.kilo/worktrees/**", "**/node_modules/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "clover"],
      reportsDirectory: "./coverage",
      include: ["src/**"],
    },
  },
});
