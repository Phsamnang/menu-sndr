import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for menu-sndr.
 * - Boots `npm run dev` automatically (reuses an existing server locally).
 * - Runs against the seeded Neon dev DB. Tests use timestamped names to avoid collisions.
 * - Storage state per role is created by e2e/global-setup.ts and read via fixtures.
 */
export default defineConfig({
  testDir: "./e2e",
  testIgnore: ["**/.auth/**", "**/fixtures/**", "**/global-setup.ts"],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: "./e2e/global-setup.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
