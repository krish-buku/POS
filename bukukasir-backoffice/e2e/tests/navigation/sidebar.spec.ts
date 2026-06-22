import { test, expect } from '@playwright/test';
import { loginAndSelectBusiness } from '../../fixtures/auth';

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await loginAndSelectBusiness(page);
  });

  test('should navigate to all main pages via sidebar', async ({ page }) => {
    const sidebar = page.locator('[data-sidebar="sidebar"]');

    // Navigate to Menu
    await sidebar.getByText('Konfigurasi Menu').click();
    await expect(page.getByRole('heading', { name: 'Konfigurasi Menu' })).toBeVisible({ timeout: 10000 });

    // Navigate to Reports
    await sidebar.getByText('Pusat Laporan').click();
    await expect(page.getByRole('heading', { name: 'Pusat Laporan' })).toBeVisible({ timeout: 10000 });

    // Navigate back to Dashboard
    await sidebar.getByText('Dasbor').click();
    await expect(page.getByRole('heading', { name: 'Dasbor' })).toBeVisible({ timeout: 10000 });
  });

  test('should expand settings submenu', async ({ page }) => {
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    // Click on "Pengaturan Global" to expand
    await sidebar.getByText('Pengaturan Global').click();
    // Sub-items should be visible
    await expect(sidebar.getByText('Metode Pembayaran')).toBeVisible();
    await expect(sidebar.getByText('Konfigurasi Struk')).toBeVisible();
    await expect(sidebar.getByText('Pengaturan Print Dapur')).toBeVisible();
    await expect(sidebar.getByText('Pengaturan Diskon')).toBeVisible();
    await expect(sidebar.getByText('Pengaturan Biaya Tambahan')).toBeVisible();
    await expect(sidebar.getByText('Administrasi Staf')).toBeVisible();
    await expect(sidebar.getByText('Pengaturan Bisnis')).toBeVisible();
  });

  test('should navigate to all settings pages', async ({ page }) => {
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    // Expand settings submenu
    await sidebar.getByText('Pengaturan Global').click();

    // Navigate to each settings page
    await sidebar.getByText('Metode Pembayaran').click();
    await expect(page.getByText('Kelola metode pembayaran yang tersedia di kasir')).toBeVisible({ timeout: 10000 });

    await sidebar.getByText('Konfigurasi Struk').click();
    await expect(page.getByText('Header Struk')).toBeVisible({ timeout: 10000 });

    await sidebar.getByText('Pengaturan Print Dapur').click();
    await expect(page.getByText('Atur informasi yang ditampilkan pada tiket cetak dapur')).toBeVisible({ timeout: 10000 });

    await sidebar.getByText('Pengaturan Diskon').click();
    await expect(page.getByText('Tombol Diskon Cepat')).toBeVisible({ timeout: 10000 });

    await sidebar.getByText('Pengaturan Biaya Tambahan').click();
    await expect(page.getByText('Biaya pelayanan yang ditambahkan ke setiap transaksi')).toBeVisible({ timeout: 10000 });

    await sidebar.getByText('Administrasi Staf').click();
    await expect(page.getByText('Direktori Staf')).toBeVisible({ timeout: 10000 });

    await sidebar.getByText('Pengaturan Bisnis').click();
    await expect(page.getByText('Profil Bisnis')).toBeVisible({ timeout: 10000 });
  });

  test('should show active page highlighted', async ({ page }) => {
    // On dashboard, the "Dasbor" sidebar link should have data-active attribute
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    const dashboardLink = sidebar.locator('[data-active]').filter({ hasText: 'Dasbor' });
    await expect(dashboardLink).toBeVisible();

    // Navigate to Menu
    await sidebar.getByText('Konfigurasi Menu').click();
    await expect(page.getByRole('heading', { name: 'Konfigurasi Menu' })).toBeVisible({ timeout: 10000 });
    const menuLink = sidebar.locator('[data-active]').filter({ hasText: 'Konfigurasi Menu' });
    await expect(menuLink).toBeVisible();
  });

  test('should show business switcher in header', async ({ page }) => {
    // The header should show the current business name
    const header = page.locator('header');
    await expect(header.getByText('Warung Nusantara')).toBeVisible();
    // Click on business switcher
    await header.getByText('Warung Nusantara').click();
    // Dropdown should show "Ganti Bisnis" label
    await expect(page.getByText('Ganti Bisnis')).toBeVisible();
    // Should show both businesses in the dropdown
    await expect(page.getByRole('menuitem', { name: 'Warung Nusantara' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Kopi Kenangan Senja' })).toBeVisible();
  });
});
