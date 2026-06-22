import { test, expect } from '@playwright/test';
import { loginAndSelectBusiness } from '../../fixtures/auth';

test.describe('Fee Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await loginAndSelectBusiness(page);
    // Navigate to settings > fees via sidebar
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await sidebar.getByText('Pengaturan Global').click();
    await sidebar.getByText('Pengaturan Biaya Tambahan').click();
    await expect(page.getByText('Biaya pelayanan yang ditambahkan ke setiap transaksi')).toBeVisible({ timeout: 10000 });
  });

  test('should display fee settings', async ({ page }) => {
    await expect(page.getByText('Service Charge (PB1)')).toBeVisible();
    await expect(page.getByText('Biaya Kemasan')).toBeVisible();
    await expect(page.getByText('Biaya Kustom')).toBeVisible();
    // Custom fees table
    await expect(page.getByText('Biaya Delivery')).toBeVisible();
    await expect(page.getByText('Biaya Platform')).toBeVisible();
  });

  test('should toggle service charge', async ({ page }) => {
    // Service charge starts as enabled - use specific container
    const serviceRow = page.locator('div').filter({ hasText: /^Service Charge \(PB1\)Biaya pelayanan yang ditambahkan ke setiap transaksi$/ });
    const serviceSwitch = serviceRow.getByRole('switch');
    await expect(serviceSwitch).toBeChecked();
    // Toggle off
    await serviceSwitch.click();
    await expect(serviceSwitch).not.toBeChecked();
  });

  test('should open add custom fee dialog', async ({ page }) => {
    await page.getByRole('button', { name: /Tambah Biaya/ }).click();
    await expect(page.getByText('Tambah Biaya Baru')).toBeVisible();
    await expect(page.getByText('Masukkan detail biaya tambahan')).toBeVisible();
    await expect(page.getByLabel('Nama Biaya')).toBeVisible();
  });
});
