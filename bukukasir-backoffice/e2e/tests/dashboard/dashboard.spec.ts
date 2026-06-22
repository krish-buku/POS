import { test, expect } from '@playwright/test';
import { loginAndSelectBusiness } from '../../fixtures/auth';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await loginAndSelectBusiness(page);
  });

  test('should display revenue cards', async ({ page }) => {
    await expect(page.getByText('Pendapatan Hari Ini')).toBeVisible();
    await expect(page.getByText('Pendapatan Minggu Ini')).toBeVisible();
    await expect(page.getByText('Jumlah Pesanan').first()).toBeVisible();
    await expect(page.getByText('Pesanan Aktif').first()).toBeVisible();
  });

  test('should display revenue chart', async ({ page }) => {
    await expect(page.getByText('Tren Pendapatan (7 Hari Terakhir)')).toBeVisible();
  });

  test('should display recent transactions table', async ({ page }) => {
    await expect(page.getByText('Transaksi Terakhir')).toBeVisible();
    // Check table headers exist
    await expect(page.getByRole('columnheader', { name: 'No. Pesanan' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Meja' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Total' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
  });

  test('should display quick action buttons', async ({ page }) => {
    await expect(page.getByText('Aksi Cepat')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tambah Pesanan Baru' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Lihat Laporan Harian' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Kelola Staf' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pengaturan Kasir' })).toBeVisible();
  });

  test('should have working sidebar navigation', async ({ page }) => {
    // The sidebar should show main navigation items
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await expect(sidebar.getByText('Dasbor')).toBeVisible();
    await expect(sidebar.getByText('Konfigurasi Menu')).toBeVisible();
    await expect(sidebar.getByText('Pusat Laporan')).toBeVisible();
    await expect(sidebar.getByText('Pengaturan Global')).toBeVisible();
  });
});
