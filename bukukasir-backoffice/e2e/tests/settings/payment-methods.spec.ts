import { test, expect } from '@playwright/test';
import { loginAndSelectBusiness } from '../../fixtures/auth';

test.describe('Payment Methods Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await loginAndSelectBusiness(page);
    // Navigate to settings > payments via sidebar
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await sidebar.getByText('Pengaturan Global').click();
    await sidebar.getByText('Metode Pembayaran').click();
    await expect(page.getByText('Kelola metode pembayaran yang tersedia di kasir')).toBeVisible({ timeout: 10000 });
  });

  test('should display payment methods list', async ({ page }) => {
    // Should have table with methods
    await expect(page.getByRole('cell', { name: /Tunai/ })).toBeVisible();
    await expect(page.getByRole('cell', { name: /QRIS/ })).toBeVisible();
    await expect(page.getByRole('cell', { name: /EDC BCA/ })).toBeVisible();
    await expect(page.getByRole('cell', { name: /GoPay/ })).toBeVisible();
  });

  test('should show Cash as first with Wajib badge', async ({ page }) => {
    // Tunai should have "Wajib" badge
    const tunaiRow = page.locator('tr').filter({ hasText: 'Tunai' });
    await expect(tunaiRow.getByText('Wajib')).toBeVisible();
    // The switch for Tunai should be disabled
    const tunaiSwitch = tunaiRow.getByRole('switch');
    await expect(tunaiSwitch).toBeDisabled();
  });

  test('should open add method dialog', async ({ page }) => {
    await page.getByRole('button', { name: /Tambah Metode/ }).click();
    await expect(page.getByText('Tambah Metode Pembayaran')).toBeVisible();
    await expect(page.getByText('Masukkan nama metode pembayaran baru')).toBeVisible();
    await expect(page.getByPlaceholder('Contoh: Dana, OVO, LinkAja')).toBeVisible();
  });

  test('should toggle method active/inactive', async ({ page }) => {
    // Find QRIS row and toggle its switch
    const qrisRow = page.locator('tr').filter({ hasText: 'QRIS' });
    const qrisSwitch = qrisRow.getByRole('switch');
    // It should start as active (checked)
    await expect(qrisSwitch).toBeChecked();
    // Click to toggle off
    await qrisSwitch.click();
    await expect(qrisSwitch).not.toBeChecked();
    // Should show "Nonaktif" text
    await expect(qrisRow.getByText('Nonaktif')).toBeVisible();
  });
});
