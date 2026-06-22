import { test, expect } from '@playwright/test';
import { loginAndSelectBusiness } from '../../fixtures/auth';

test.describe('Staff Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await loginAndSelectBusiness(page);
    // Navigate to settings > staff via sidebar
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await sidebar.getByText('Pengaturan Global').click();
    await sidebar.getByText('Administrasi Staf').click();
    await expect(page.getByText('Direktori Staf')).toBeVisible({ timeout: 10000 });
  });

  test('should display staff directory table', async ({ page }) => {
    await expect(page.getByText('Direktori Staf')).toBeVisible();
    // Table headers
    const staffTable = page.locator('table').first();
    await expect(staffTable.getByRole('columnheader', { name: 'Nama' })).toBeVisible();
    await expect(staffTable.getByRole('columnheader', { name: 'Peran' })).toBeVisible();
    await expect(staffTable.getByRole('columnheader', { name: 'Telepon' })).toBeVisible();
    await expect(staffTable.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    // Should have at least one staff member row
    await expect(staffTable.locator('tbody tr').first()).toBeVisible();
  });

  test('should open add staff dialog', async ({ page }) => {
    await page.getByRole('button', { name: /Tambah Staf/ }).click();
    await expect(page.getByText('Tambah Staf Baru')).toBeVisible();
    await expect(page.getByText('Masukkan data staf baru yang akan ditambahkan')).toBeVisible();
  });

  test('should show staff performance section', async ({ page }) => {
    await expect(page.getByText('Ringkasan Performa Staf')).toBeVisible();
    // Performance table
    const perfTable = page.locator('table').nth(1);
    await expect(perfTable.getByRole('columnheader', { name: 'Nama' })).toBeVisible();
    await expect(perfTable.getByRole('columnheader', { name: 'Pesanan Diproses' })).toBeVisible();
    await expect(perfTable.getByRole('columnheader', { name: 'Total Penjualan' })).toBeVisible();
  });
});
