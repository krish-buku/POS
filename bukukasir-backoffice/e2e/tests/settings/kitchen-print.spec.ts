import { test, expect } from '@playwright/test';
import { loginAndSelectBusiness } from '../../fixtures/auth';

test.describe('Kitchen Print Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await loginAndSelectBusiness(page);
    // Navigate to settings > kitchen-print via sidebar
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await sidebar.getByText('Pengaturan Global').click();
    await sidebar.getByText('Pengaturan Print Dapur').click();
    await expect(page.getByText('Atur informasi yang ditampilkan pada tiket cetak dapur')).toBeVisible({ timeout: 10000 });
  });

  test('should display kitchen print settings', async ({ page }) => {
    await expect(page.getByText('Pratinjau Tiket Dapur')).toBeVisible();
    // Check toggle labels
    await expect(page.getByText('Tampilkan Meja')).toBeVisible();
    await expect(page.getByText('Tampilkan Sesi')).toBeVisible();
    await expect(page.getByText('Tampilkan Staf').first()).toBeVisible();
    await expect(page.getByText('Tampilkan Catatan', { exact: true })).toBeVisible();
    await expect(page.getByText('Cetak Otomatis ke Dapur')).toBeVisible();
    await expect(page.getByText('Penanda Cetak Ulang')).toBeVisible();
  });

  test('should toggle field visibility', async ({ page }) => {
    // "Penanda Cetak Ulang" starts as off - use specific container
    const reprintRow = page.locator('div').filter({ hasText: /^Penanda Cetak UlangTampilkan tanda/ });
    const reprintSwitch = reprintRow.getByRole('switch');
    // Should start as unchecked
    await expect(reprintSwitch).not.toBeChecked();
    await reprintSwitch.click();
    await expect(reprintSwitch).toBeChecked();
    // The preview should now show "*** CETAK ULANG ***"
    await expect(page.getByText('*** CETAK ULANG ***')).toBeVisible();
  });
});
