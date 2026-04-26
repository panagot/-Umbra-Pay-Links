import { defineConfig, devices } from "@playwright/test";

const port = process.env.PORT ?? "3000";
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

/**
 * E2E: builds production bundle, serves with `next start`, hits all main routes + API.
 * Reuse an already-running server on the same port when not in CI (e.g. `npm run dev`).
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "npm run build && npm run start",
    url: baseURL,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: { ...process.env, PORT: port },
  },
});
