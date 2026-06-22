import { test, expect } from '@playwright/test';
import { loginAndSelectBusiness } from '../../fixtures/auth';

test.describe('Menu Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await loginAndSelectBusiness(page);
    // Navigate to menu page via sidebar
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await sidebar.getByText('Konfigurasi Menu').click();
    await expect(page.getByRole('heading', { name: 'Konfigurasi Menu' })).toBeVisible({ timeout: 10000 });
  });

  test('should display category tab by default', async ({ page }) => {
    // "Kategori" tab should be active by default
    await expect(page.getByRole('tab', { name: 'Kategori' })).toBeVisible();
    // Should show categories with "kategori" count text
    await expect(page.getByText(/\d+ kategori/)).toBeVisible();
    // Should show "Tambah Kategori" button
    await expect(page.getByRole('button', { name: 'Tambah Kategori' })).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    // Click Menu Item tab
    await page.getByRole('tab', { name: 'Menu Item' }).click();
    await expect(page.getByRole('button', { name: 'Tambah Menu' })).toBeVisible();

    // Click Modifier tab
    await page.getByRole('tab', { name: 'Modifier' }).click();
    await expect(page.getByText(/\d+ grup modifier/)).toBeVisible();

    // Click back to Categories tab
    await page.getByRole('tab', { name: 'Kategori' }).click();
    await expect(page.getByRole('button', { name: 'Tambah Kategori' })).toBeVisible();
  });

  test('should display menu items in table', async ({ page }) => {
    await page.getByRole('tab', { name: 'Menu Item' }).click();
    // Should have table headers
    await expect(page.getByRole('columnheader', { name: 'Nama' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Kategori' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Harga' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    // Should have some rows
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('should open add menu item dialog', async ({ page }) => {
    await page.getByRole('tab', { name: 'Menu Item' }).click();
    await page.getByRole('button', { name: 'Tambah Menu' }).click();
    // Dialog should open
    await expect(page.getByText('Tambah Menu Baru')).toBeVisible();
    await expect(page.getByText('Isi detail menu yang ingin ditambahkan.')).toBeVisible();
  });

  test('should open add category dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Tambah Kategori' }).click();
    // Dialog should open with title
    await expect(page.getByText('Masukkan nama kategori baru untuk menu Anda.')).toBeVisible();
  });

  test('should display modifiers tab with modifier groups', async ({ page }) => {
    await page.getByRole('tab', { name: 'Modifier' }).click();
    await expect(page.getByText('Tambahan Protein')).toBeVisible();
    await expect(page.getByText('Level Pedas')).toBeVisible();
    await expect(page.getByText('Pilihan Nasi')).toBeVisible();
    await expect(page.getByText('Tambahan Minuman')).toBeVisible();
  });

  test('should search/filter menu items', async ({ page }) => {
    await page.getByRole('tab', { name: 'Menu Item' }).click();
    // Wait for table to render
    await expect(page.locator('tbody tr').first()).toBeVisible();
    // Use the search input
    await page.getByPlaceholder('Cari menu...').fill('Nasi');
    // Wait for filter to apply
    await page.waitForTimeout(300);
    const visibleRows = page.locator('tbody tr');
    const count = await visibleRows.count();
    expect(count).toBeGreaterThan(0);
  });
});
