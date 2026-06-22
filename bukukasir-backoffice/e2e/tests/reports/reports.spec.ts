import { test, expect } from '@playwright/test';
import { loginAndSelectBusiness } from '../../fixtures/auth';

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await loginAndSelectBusiness(page);
    // Navigate to reports page via sidebar
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await sidebar.getByText('Pusat Laporan').click();
    await expect(page.getByRole('heading', { name: 'Pusat Laporan' })).toBeVisible({ timeout: 10000 });
  });

  test('should display summary cards', async ({ page }) => {
    await expect(page.getByText('Total Pendapatan')).toBeVisible();
    await expect(page.getByText('Jumlah Pesanan').first()).toBeVisible();
    await expect(page.getByText('Rata-rata Pesanan')).toBeVisible();
    await expect(page.getByText('Pesanan Void')).toBeVisible();
  });

  test('should display revenue chart', async ({ page }) => {
    await expect(page.getByText('Tren Pendapatan')).toBeVisible();
    await expect(page.getByText('Metode Pembayaran').first()).toBeVisible();
  });

  test('should switch between date ranges', async ({ page }) => {
    // Date range buttons should be visible
    await expect(page.getByRole('button', { name: 'Hari Ini' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Minggu Ini' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bulan Ini' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Kustom' })).toBeVisible();

    // Click "Minggu Ini"
    await page.getByRole('button', { name: 'Minggu Ini' }).click();
    // Click "Bulan Ini"
    await page.getByRole('button', { name: 'Bulan Ini' }).click();
  });

  test('should switch between report tabs', async ({ page }) => {
    // Tabs should be visible
    await expect(page.getByRole('tab', { name: 'Penjualan' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Keuangan' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Menu' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Meja Terbuka' })).toBeVisible();

    // Click Keuangan tab
    await page.getByRole('tab', { name: 'Keuangan' }).click();
    await expect(page.getByText('Ringkasan Keuangan')).toBeVisible();

    // Click Menu tab
    await page.getByRole('tab', { name: 'Menu' }).click();
    await expect(page.getByText('Menu Terlaris')).toBeVisible();

    // Click Meja Terbuka tab
    await page.getByRole('tab', { name: 'Meja Terbuka' }).click();
    // Should show open tables or empty state - wait a bit for content
    await page.waitForTimeout(500);
  });

  test('should display transactions in sales tab', async ({ page }) => {
    // Sales tab should be active by default
    await expect(page.getByText('Riwayat Transaksi')).toBeVisible();
    // Table headers
    await expect(page.getByRole('columnheader', { name: 'Tanggal' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'No. Pesanan' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Total' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    // Should have at least one row
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
  });
});
