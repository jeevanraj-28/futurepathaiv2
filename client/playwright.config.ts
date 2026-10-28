import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against the real API and SQLite dev database.
 * Accounts they create use the @futurepath.test domain and are removed afterwards.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  globalTeardown: './e2e/teardown.ts',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm --prefix ../server run dev',
      url: 'http://localhost:5000/api/health',
      reuseExistingServer: true,
      env: { PORT: '5000' },
      timeout: 120_000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
