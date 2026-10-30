import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    // Full assertion diffs: the oracle's failure messages are the governor's only view of behaviour.
    chaiConfig: { truncateThreshold: 0 },
  },
});
