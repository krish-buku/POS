import { test, expect } from '@playwright/test';

test.describe('Cashier - Payment Route', () => {
  test('shows redesigned standalone payment surface', async ({ page }) => {
    await page.goto('/?e2eRole=cashier&e2eTarget=payment');
    await expect(page.getByText('Pay').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('No active order')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Load demo order' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Add customer|Tambah customer/ })).toHaveCount(0);
    await expect(page.getByText('Cash', { exact: true })).toBeVisible();
    await expect(page.getByText('QRIS', { exact: true })).toBeVisible();
  });

  test('loads demo order and completes E-wallet with mock reference', async ({ page }) => {
    await page.goto('/?e2eRole=cashier&e2eTarget=payment');
    await expect(page.getByRole('button', { name: 'Load demo order' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Load demo order' }).click();

    await expect(page.getByText('Nasi Goreng Spesial').first()).toBeVisible();
    await page.getByText('E-wallet', { exact: true }).click();
    await expect(page.getByText('Reference is required for EWALLET payments.')).toBeVisible();
    await page.getByRole('button', { name: 'Complete with mock reference' }).click();

    await expect(page.getByText('Pembayaran berhasil')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/EWALLET-MOCK-/)).toBeVisible();
    await expect(page.getByText('Printer fallback', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: /Send digital receipt|Kirim digital receipt/ }).click();
    await expect(page.getByText('Digital receipt queued')).toBeVisible();
    await page.getByRole('button', { name: /Close|Tutup/ }).last().click();
    await page.getByRole('button', { name: 'Print receipt' }).click();
    await expect(page.getByText('Printer fallback', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Print later' }).click();
    await expect(page.getByText('Print queued')).toBeVisible();
  });
});
