import { defineConfig, devices } from '@playwright/test';

// Browser-automation tests run against the *built* site served by `astro
// preview` (production output, not the dev server) so what CI verifies is what
// GitHub Pages ships. Use an isolated port so an unrelated local Astro server
// can never turn a green product test into a test of the wrong website.
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 4371);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --host`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
