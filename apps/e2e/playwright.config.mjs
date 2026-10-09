import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests", timeout: 180_000, expect: { timeout: 15_000 }, workers: 1, retries: 0, reporter: "list",
  outputDir: ".playwright-results",
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], channel: "chrome" } }],
  webServer: { command: "node fixture-server.mjs", url: "http://127.0.0.1:3100/sign-in", reuseExistingServer: false, timeout: 90_000 },
});
