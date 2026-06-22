import { type Page, expect } from '@playwright/test';

/**
 * End-to-end login helper:
 *  /login (phone) → /verify-otp (code 123456) → /select-business (first card) → /dashboard
 * Tolerant to copy + placeholder drift.
 */
export async function loginAndSelectBusiness(page: Page) {
  await page.goto('/login');
  await expect(page).toHaveURL(/\/login/);

  const phoneInput = page
    .locator('input[type="tel"], input[inputmode="numeric"], input[placeholder*="8123"]')
    .first();
  await phoneInput.fill('8123456789');

  await page.getByRole('button', { name: /OTP/i }).first().click();

  await expect(page).toHaveURL(/\/verify-otp/, { timeout: 10000 });

  const otpInputs = page.locator('input[inputmode="numeric"], input[type="text"][maxlength="1"]');
  const count = await otpInputs.count();
  if (count >= 6) {
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill('123456'[i]);
    }
  } else {
    await page.locator('input').first().fill('123456');
  }

  await expect(page).toHaveURL(/\/select-business/, { timeout: 15000 });

  // Wait for the business list to hydrate
  await expect(page.getByRole('option').first()).toBeVisible({ timeout: 10000 });

  // Click the first business option
  await page.getByRole('option').first().click();

  // If there's a secondary "enter store" confirmation button, click it
  const enterBtn = page.getByRole('button', { name: /Masuk ke Toko/i });
  if (await enterBtn.count()) {
    await enterBtn.first().click();
  }

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}
