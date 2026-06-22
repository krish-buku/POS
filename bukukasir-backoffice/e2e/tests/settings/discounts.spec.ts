import { test, expect } from '@playwright/test';
import { loginAndSelectBusiness } from '../../fixtures/auth';

test.describe('Discount Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await loginAndSelectBusiness(page);
    // Navigate to settings > discounts via sidebar
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await sidebar.getByText('Pengaturan Global').click();
    await sidebar.getByText('Pengaturan Diskon').click();
    await expect(page.getByText('Tombol Diskon Cepat')).toBeVisible({ timeout: 10000 });
  });

  test('should display preset discount buttons', async ({ page }) => {
    await expect(page.getByText('Tombol Diskon Cepat')).toBeVisible();
    // Should show preset discount buttons (use exact match to avoid 5% matching 15%)
    await expect(page.getByRole('button', { name: '5%', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '10%', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '15%', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '20%', exact: true })).toBeVisible();
  });

  test('should display role limits table', async ({ page }) => {
    await expect(page.getByText('Batas Maksimum Diskon per Peran')).toBeVisible();
    // Check table content
    await expect(page.getByRole('cell', { name: 'Kasir' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Manajer' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Pemilik' })).toBeVisible();
    await expect(page.getByText('Tidak Terbatas')).toBeVisible();
  });

  test('should toggle disable all discounts', async ({ page }) => {
    await expect(page.getByText('Nonaktifkan Semua Diskon')).toBeVisible();
    // Find the toggle - use the specific container
    const disableRow = page.locator('div').filter({ hasText: /^Nonaktifkan Semua DiskonMenonaktifkan seluruh fungsi diskon di aplikasi kasir$/ });
    const disableSwitch = disableRow.getByRole('switch');
    // Should start as off
    await expect(disableSwitch).not.toBeChecked();
    // Toggle on
    await disableSwitch.click();
    await expect(disableSwitch).toBeChecked();
    // Warning banner should appear
    await expect(page.getByText('Semua diskon saat ini dinonaktifkan')).toBeVisible();
  });
});
