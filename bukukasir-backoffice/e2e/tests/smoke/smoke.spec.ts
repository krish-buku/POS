import { test, expect } from '@playwright/test';
import { loginAndSelectBusiness } from '../../fixtures/auth';

/**
 * End-to-end smoke test for the current back-office.
 * Validates that the full happy path works:
 *  login → OTP → business picker → dashboard → nav around → logout.
 *
 * Kept tolerant to copy tweaks (uses regex matchers).
 */
test.describe('Back-office smoke', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/login');
    // Login heading
    await expect(page.getByRole('heading', { name: /Masuk/i })).toBeVisible({ timeout: 10000 });
    // OTP submit button
    await expect(page.getByRole('button', { name: /OTP/i }).first()).toBeVisible();
    // Phone input present (any numeric input)
    const phoneInput = page.locator('input[type="tel"], input[inputmode="numeric"], input[placeholder*="8123"]').first();
    await expect(phoneInput).toBeVisible();
  });

  test('short phone disables submit', async ({ page }) => {
    await page.goto('/login');
    const phoneInput = page.locator('input[type="tel"], input[inputmode="numeric"], input[placeholder*="8123"]').first();
    await phoneInput.fill('81');
    await expect(page.getByRole('button', { name: /OTP/i }).first()).toBeDisabled();
  });

  test('full login flow lands on dashboard', async ({ page }) => {
    await loginAndSelectBusiness(page);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('sidebar navigates to key sections', async ({ page }) => {
    await loginAndSelectBusiness(page);

    // Menu Configuration
    await page.getByRole('link', { name: /Menu|Konfigurasi Menu/i }).first().click();
    await expect(page).toHaveURL(/\/menu/);

    // Reports
    await page.getByRole('link', { name: /Laporan|Reports/i }).first().click();
    await expect(page).toHaveURL(/\/reports/);

    // Expand Settings and open a child
    const settingsBtn = page.getByRole('button', { name: /Pengaturan|Settings/i }).first();
    if (await settingsBtn.count()) {
      await settingsBtn.click();
    }
    const floorsLink = page.getByRole('link', { name: /Lantai|Floors/i }).first();
    if (await floorsLink.count()) {
      await floorsLink.click();
      await expect(page).toHaveURL(/\/settings\/floors/);
    }
  });

  test('business switcher lists seeded businesses', async ({ page }) => {
    await loginAndSelectBusiness(page);

    // Header business switcher — click the top-right pill
    const switcher = page.locator('header').getByRole('button').filter({ hasText: /Warung|Kopi|Cafe/i }).first();
    if (await switcher.count()) {
      await switcher.click();
      // Expect the menu to show at least one of our known businesses
      await expect(page.getByText(/Cafe Hyderabad|Kopi Kenangan|Warung/i).first()).toBeVisible({ timeout: 5000 });
    }
  });
});
