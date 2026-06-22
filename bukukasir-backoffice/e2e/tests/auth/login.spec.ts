import { test, expect } from '@playwright/test';
import { loginAndSelectBusiness } from '../../fixtures/auth';

test.describe('Auth Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure clean state
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
  });

  test('should display login page with phone input', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Masuk ke Akun Anda')).toBeVisible();
    await expect(page.getByText('Masukkan nomor telepon untuk menerima kode OTP')).toBeVisible();
    await expect(page.getByPlaceholder('812 3456 7890')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Kirim OTP' })).toBeVisible();
    // Check the +62 prefix is shown
    await expect(page.getByText('+62')).toBeVisible();
  });

  test('should show error for short phone number', async ({ page }) => {
    await page.goto('/login');
    // Enter a short phone number (< 9 digits)
    await page.getByPlaceholder('812 3456 7890').fill('8123');
    // Button should be disabled
    await expect(page.getByRole('button', { name: 'Kirim OTP' })).toBeDisabled();
  });

  test('should navigate to OTP page after sending', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('812 3456 7890').fill('812 3456 7890');
    await page.getByRole('button', { name: 'Kirim OTP' }).click();
    await expect(page.getByText('Verifikasi OTP')).toBeVisible({ timeout: 10000 });
    // OTP inputs should be present (6 of them)
    const otpInputs = page.locator('input[inputmode="numeric"]');
    await expect(otpInputs).toHaveCount(6);
  });

  test('should verify OTP with correct code "123456"', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('812 3456 7890').fill('812 3456 7890');
    await page.getByRole('button', { name: 'Kirim OTP' }).click();
    await expect(page.getByText('Verifikasi OTP')).toBeVisible({ timeout: 10000 });

    // Enter OTP digits
    const otpInputs = page.locator('input[inputmode="numeric"]');
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill('123456'[i]);
    }

    // Should navigate to select-business
    await expect(page.getByText('Pilih Bisnis Anda')).toBeVisible({ timeout: 10000 });
  });

  test('should show business selector after OTP', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('812 3456 7890').fill('812 3456 7890');
    await page.getByRole('button', { name: 'Kirim OTP' }).click();
    await expect(page.getByText('Verifikasi OTP')).toBeVisible({ timeout: 10000 });

    const otpInputs = page.locator('input[inputmode="numeric"]');
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill('123456'[i]);
    }

    await expect(page.getByText('Pilih Bisnis Anda')).toBeVisible({ timeout: 10000 });
    // Should show both businesses
    await expect(page.getByText('Warung Nusantara')).toBeVisible();
    await expect(page.getByText('Kopi Kenangan Senja')).toBeVisible();
    // Should show "Tambah Bisnis" button
    await expect(page.getByText('Tambah Bisnis +')).toBeVisible();
  });

  test('should navigate to dashboard after selecting business', async ({ page }) => {
    await loginAndSelectBusiness(page);
    await expect(page.getByRole('heading', { name: 'Dasbor' })).toBeVisible();
    await expect(page.getByText('Ringkasan bisnis Anda hari ini')).toBeVisible();
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to login
    await expect(page.getByText('Masuk ke Akun Anda')).toBeVisible({ timeout: 10000 });
  });

  test('should logout and return to login', async ({ page }) => {
    await loginAndSelectBusiness(page);
    await expect(page.getByRole('heading', { name: 'Dasbor' })).toBeVisible();

    // Click user avatar to open dropdown (the last button in the header with initials)
    const avatarButton = page.locator('header button').last();
    await avatarButton.click();

    // Click "Keluar"
    await page.getByRole('menuitem', { name: 'Keluar' }).click();

    // Should be back at login
    await expect(page.getByText('Masuk ke Akun Anda')).toBeVisible({ timeout: 10000 });
  });
});
