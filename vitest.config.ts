import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./scripts/test-setup.ts"],
    include: [
      "reps/**/.verify/*.test.tsx",
      ".tmp/**/.verify/*.test.tsx",
      "apps/**/acceptance.test.tsx",
      "coding/**/*.test.ts",
    ],
    testTimeout: 15000,
  },
});
