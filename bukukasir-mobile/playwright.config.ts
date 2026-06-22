import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 30000,
  retries: 1,
  workers: 1,
  use: {
    baseURL: 'http://localhost:8100',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: 'npx expo start --web --port 8100',
    port: 8100,
    timeout: 60000,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
