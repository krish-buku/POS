import { test, expect } from '@playwright/test';

test.describe('Auth - Onboarding Setup', () => {
  test('blocks invalid owner phone before moving forward', async ({ page }) => {
    await page.goto('/(auth)/onboarding');
    await expect(page.getByText('Welcome to BukuKasir')).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Owner phone', { exact: true })).toBeVisible();

    await page.locator('input').first().fill('12');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Enter a valid owner phone number.')).toBeVisible();
    await expect(page.getByText('Owner phone', { exact: true })).toBeVisible();

    await page.locator('input').first().fill('8123456789');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('OTP verification')).toBeVisible();
  });

  test('exposes tax toggle as a working switch', async ({ page }) => {
    await page.goto('/(auth)/onboarding');
    await expect(page.getByText('Welcome to BukuKasir')).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Step 5: Tax & hours' }).click();
    await expect(page.getByText('Tax and hours')).toBeVisible();

    const taxSwitch = page.getByRole('switch', { name: 'Tax enabled' });
    await expect(taxSwitch).toHaveAttribute('aria-checked', 'true');
    await taxSwitch.click();
    await expect(taxSwitch).toHaveAttribute('aria-checked', 'false');
  });

  test('saves the full setup and returns to login', async ({ page }) => {
    await page.goto('/(auth)/onboarding');
    await expect(page.getByText('Setup BukuKasir POS')).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Owner phone')).toBeVisible();
    await page.locator('input').first().fill('8123456789');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByText('OTP verification')).toBeVisible();
    await page.locator('input').first().fill('123456');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByText('Business profile')).toBeVisible();
    await page.locator('input').first().fill('Buku Test Cafe');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByText('Tax and hours')).toBeVisible();
    await page.locator('input').first().fill('7');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByText('Table setup')).toBeVisible();
    await page.locator('input').first().fill('12');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByText('Menu seed')).toBeVisible();
    await page.locator('textarea, input').first().fill('Nasi Goreng, Soto Ayam, Kopi Susu');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByText('Staff invite')).toBeVisible();
    await page.locator('input').first().fill('+6281377001111');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByText('Ready to save')).toBeVisible();
    await page.getByRole('button', { name: 'Save setup' }).click();
    await expect(page.getByText('Business setup saved. Continue to login.')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Setup complete')).toBeVisible();

    await page.getByRole('button', { name: 'Go to login' }).click();
    await expect(page.getByText('Sign in to your account').or(page.getByText('Masuk ke Akun'))).toBeVisible({ timeout: 10000 });
  });
});
