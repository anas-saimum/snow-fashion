import { defineConfig, devices } from "@playwright/test";

const SHOP_PORT = 3100;
const ADMIN_PORT = 3101;
const SHOP_URL = "http://127.0.0.1:" + SHOP_PORT;
const ADMIN_URL = "http://127.0.0.1:" + ADMIN_PORT;

const next = "node node_modules/next/dist/bin/next";

/**
 * Two servers, because the two halves live in different habitats.
 *
 * The storefront is tested against a production build, so tests exercise the
 * same output that ships. The admin is tested against a dev server, because
 * its in-memory backend is a development-only mode by design — in production
 * without Supabase the dashboard correctly refuses to load at all.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  timeout: 45_000,
  expect: { timeout: 10_000 },

  use: { trace: "retain-on-failure" },

  projects: [
    {
      name: "desktop-chromium",
      testIgnore: /admin\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: SHOP_URL,
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile-chromium",
      testIgnore: /admin\.spec\.ts/,
      use: { ...devices["Pixel 7"], baseURL: SHOP_URL },
    },
    {
      name: "admin",
      testMatch: /admin\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: ADMIN_URL,
        viewport: { width: 1440, height: 900 },
      },
    },
  ],

  webServer: [
    {
      command: next + " build && " + next + " start --port " + SHOP_PORT,
      url: SHOP_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: next + " dev --port " + ADMIN_PORT,
      url: ADMIN_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        // Its own build directory: sharing .next with the production server
        // above means the dev server overwrites the build being served.
        NEXT_DIST_DIR: ".next-dev",
        // The suite drives the open demo-mode dashboard. An empty value is
        // "already set" to Next's env loader, so a developer's .env.local
        // credentials cannot put a login page in front of the tests.
        ADMIN_LOGIN_ID: "",
        ADMIN_PASSWORD: "",
      },
    },
  ],
});
