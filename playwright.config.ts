import { defineConfig } from '@playwright/test';

/**
 * BukuKasir Backend API E2E Tests
 *
 * Prerequisites:
 *   All 14 microservices must be running before executing tests.
 *   Start them with:
 *     1. Eureka Server:   ./gradlew :services:eureka-server:bootRun
 *     2. API Gateway:     ./gradlew :services:api-gateway:bootRun
 *     3. Each service:    ./gradlew :services:<service-name>:bootRun
 *
 *   Service ports: Eureka (8761), Gateway (8080), Services (8081-8094)
 *
 * Run tests:
 *   npx playwright test                    # all tests
 *   npx playwright test auth-service       # single service
 *   npx playwright test --reporter=html    # with HTML report
 */
export default defineConfig({
  testDir: './e2e/tests',
  timeout: 30000,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
  projects: [
    {
      name: 'api-tests',
      testMatch: '**/*.spec.ts',
    },
  ],
});
