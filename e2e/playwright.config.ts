import { defineConfig } from '@playwright/test'
import path from 'path'

/**
 * Playwright configuration for Electron E2E tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: '.',
  testMatch: '**/*.e2e.ts',
  fullyParallel: false, // Electron tests should run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // Single worker for Electron
  reporter: [
    ['html', { outputFolder: '../playwright-report-e2e' }],
    ['list']
  ],
  timeout: 60000, // 60s timeout for Electron startup
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'electron',
      use: {},
    },
  ],
})
