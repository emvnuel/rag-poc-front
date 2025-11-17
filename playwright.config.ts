import { defineConfig, devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile device emulation
    {
      name: 'mobile-chrome',
      use: {
        ...devices['iPhone 12 Pro'],
        browserName: 'chromium',
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12 Pro'],
        browserName: 'webkit',
      },
    },

    // Tablet device emulation
    {
      name: 'tablet-chrome',
      use: {
        ...devices['iPad Pro'],
        browserName: 'chromium',
      },
    },
    {
      name: 'tablet-safari',
      use: {
        ...devices['iPad Pro'],
        browserName: 'webkit',
      },
    },
  ],

  webServer: {
    command: 'VITE_ENABLE_DEVTOOLS=false npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_ENABLE_DEVTOOLS: 'false',
    },
  },
})
