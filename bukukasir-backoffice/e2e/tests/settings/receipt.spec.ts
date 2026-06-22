import { test, expect } from '@playwright/test';
import { loginAndSelectBusiness } from '../../fixtures/auth';

test.describe('Receipt Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await loginAndSelectBusiness(page);
    // Navigate to settings > receipt via sidebar
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await sidebar.getByText('Pengaturan Global').click();
    await sidebar.getByText('Konfigurasi Struk').click();
    await expect(page.getByText('Header Struk')).toBeVisible({ timeout: 10000 });
  });

  test('should display receipt configuration form', async ({ page }) => {
    // Header section
    await expect(page.getByText('Header Struk')).toBeVisible();
    await expect(page.getByLabel('Nama Bisnis')).toBeVisible();
    await expect(page.getByLabel('Alamat')).toBeVisible();
    await expect(page.getByLabel('Telepon')).toBeVisible();
    // Footer section
    await expect(page.getByText('Footer Struk')).toBeVisible();
    await expect(page.getByLabel('Pesan Terima Kasih')).toBeVisible();
    await expect(page.getByLabel('Kebijakan Pengembalian')).toBeVisible();
    // Settings section
    await expect(page.getByText('Pengaturan Struk')).toBeVisible();
  });

  test('should show receipt preview', async ({ page }) => {
    await expect(page.getByText('Pratinjau Struk')).toBeVisible();
    // The preview should contain some known content (use exact for LOGO to avoid "Logo Bisnis")
    await expect(page.getByText('LOGO', { exact: true })).toBeVisible();
    await expect(page.getByText('Nasi Goreng Spesial')).toBeVisible();
  });

  test('should toggle print settings', async ({ page }) => {
    // Check toggle labels exist
    await expect(page.getByText('Tampilkan Pajak')).toBeVisible();
    await expect(page.getByText('Tampilkan Nama Staf')).toBeVisible();
    await expect(page.getByText('Tampilkan Waktu Pesanan')).toBeVisible();
    await expect(page.getByText('Cetak Otomatis')).toBeVisible();
    await expect(page.getByText('Salinan Duplikat')).toBeVisible();

    // Find the "Cetak Otomatis" toggle - use the specific container with exact text
    const autoPrintRow = page.locator('div').filter({ hasText: /^Cetak OtomatisCetak struk otomatis setelah pembayaran$/ });
    const autoPrintSwitch = autoPrintRow.getByRole('switch');
    // Should start as unchecked
    await expect(autoPrintSwitch).not.toBeChecked();
    await autoPrintSwitch.click();
    await expect(autoPrintSwitch).toBeChecked();
  });
});
