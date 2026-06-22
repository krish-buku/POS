import { test, expect } from '@playwright/test';
import { loginAndSelectBusiness } from '../../fixtures/auth';

test.describe('Business Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await loginAndSelectBusiness(page);
    // Navigate to settings > business via sidebar
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await sidebar.getByText('Pengaturan Global').click();
    await sidebar.getByText('Pengaturan Bisnis').click();
    await expect(page.getByText('Profil Bisnis')).toBeVisible({ timeout: 10000 });
  });

  test('should display business profile form', async ({ page }) => {
    await expect(page.getByText('Profil Bisnis')).toBeVisible();
    await expect(page.getByLabel('Nama Bisnis')).toBeVisible();
    await expect(page.getByLabel('Alamat')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    // Should have pre-filled values
    await expect(page.getByLabel('Nama Bisnis')).toHaveValue('Warung Nusantara');
  });

  test('should toggle PPN settings', async ({ page }) => {
    await expect(page.getByText('Konfigurasi Pajak')).toBeVisible();
    await expect(page.getByText('PPN (Pajak Pertambahan Nilai)')).toBeVisible();
    // The PPN switch is the first switch on this page
    // Find it by locating the specific container that only has one switch
    const ppnSection = page.locator('div').filter({ hasText: /^PPN \(Pajak Pertambahan Nilai\)Aktifkan perhitungan PPN pada transaksi$/ });
    const ppnSwitch = ppnSection.getByRole('switch');
    await expect(ppnSwitch).toBeChecked();
    // Toggle off
    await ppnSwitch.click();
    await expect(ppnSwitch).not.toBeChecked();
  });

  test('should show ownership transfer section', async ({ page }) => {
    // Use first() to avoid strict mode with card title + button text
    await expect(page.getByText('Transfer Kepemilikan').first()).toBeVisible();
    await expect(page.getByText('Pemilik Saat Ini')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Transfer Kepemilikan' })).toBeVisible();
  });

  test('should show disabled delete button', async ({ page }) => {
    await expect(page.getByText('Zona Berbahaya')).toBeVisible();
    const deleteButton = page.getByRole('button', { name: 'Hapus Bisnis' });
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton).toBeDisabled();
    await expect(page.getByText('Untuk menghapus bisnis, silakan hubungi dukungan pelanggan BukuKasir.')).toBeVisible();
  });
});
