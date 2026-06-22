import { test, expect } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

test.describe('Cashier - Redesigned Menu First Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'cashier');
    await expect(page.getByText('New order').first()).toBeVisible({ timeout: 15000 });
  });

  test('shows add items, customer, destination, and resilience surfaces', async ({ page }) => {
    await expect(page.getByText('Add items').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Step 1: Add items' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Category/ }).first()).toBeVisible();
    await expect(page.getByText('Tambah customer')).toBeVisible();
    await expect(page.getByText('Sync ready')).toBeVisible();
    await expect(page.getByText('Printer fallback ready')).toBeVisible();
    await expect(page.getByText('Nasi Goreng Spesial', { exact: true })).toBeVisible();
  });

  test('responds to header status pills, staff chip, and blocked stepper taps', async ({ page }) => {
    await page.getByTestId('stepper-step-1').click();
    await expect(page.getByText('Add an item first')).toBeVisible();
    await page.getByRole('button', { name: 'Tutup' }).click();

    await page.getByRole('button', { name: 'Sync ready' }).click();
    await expect(page.getByText('Recovery and held orders')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).last().click();

    await page.getByRole('button', { name: 'Printer fallback ready' }).click();
    await expect(page.getByText('Printer fallback', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).last().click();

    await page.getByTestId('staff-chip').click();
    await expect(page.getByText(/Profil|Profile/)).toBeVisible();
    await page.getByRole('button', { name: /Pengaturan|Settings/ }).last().click();
    await expect(page.getByText('Store operations')).toBeVisible({ timeout: 10000 });
  });

  test('adds an item, picks dine-in destination, and reaches payment', async ({ page }) => {
    const nasiGorengCard = page.getByTestId('menu-item-menu-001');
    await nasiGorengCard.click();
    await expect(page.getByText('Special instructions')).toBeVisible({ timeout: 10000 });
    await page.getByText(/Add Rp/).click();
    await expect(nasiGorengCard).toHaveAttribute('aria-selected', 'true');
    await expect(nasiGorengCard).toHaveCSS('border-color', 'rgb(17, 24, 39)');
    await expect(page.getByRole('button', { name: 'Decrease quantity' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Increase quantity' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pick destination', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Pick destination', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Decrease quantity' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Increase quantity' })).toHaveCount(0);
    await expect(page.getByText('x1')).toBeVisible();
    await expect(page.getByRole('button', { name: /Dine-in/ })).toBeVisible();
    await page.getByLabel(/T1/).click();
    await page.getByText('Continue to pay').click();
    await expect(page.getByText('Manual POS payment')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Complete payment')).toBeVisible();
  });

  test('holds and resumes a draft order with visible feedback', async ({ page }) => {
    await page.getByTestId('menu-item-menu-001').click();
    await page.getByText(/Add Rp/).click();
    await page.getByRole('button', { name: /Hold|Tahan/ }).click();
    await expect(page.getByText('Order held')).toBeVisible();
    await page.getByRole('button', { name: /Close|Tutup/ }).last().click();

    await page.getByRole('button', { name: /Recovery|Pemulihan/ }).click();
    await expect(page.getByText('Recovery and held orders')).toBeVisible();
    await page.getByRole('button', { name: /Resume|Lanjutkan/ }).click();
    await expect(page.getByText('Held order resumed')).toBeVisible();
  });

  test('supports customer sheet, adjustments, split, and printer fallback', async ({ page }) => {
    await page.getByRole('button', { name: 'Customer', exact: true }).click();
    await expect(page.getByText('Sarah Lim')).toBeVisible({ timeout: 10000 });
    await page.getByText('Sarah Lim').click();
    await page.getByTestId('menu-item-menu-001').click();
    await page.getByText(/Add Rp/).click();
    await page.getByRole('button', { name: 'Pick destination', exact: true }).click();
    await page.getByLabel(/T1/).click();
    await page.getByText('Continue to pay').click();
    await page.getByText('Discount').click();
    await expect(page.getByText('Order adjustment')).toBeVisible();
    await page.getByText('Apply discount').click();
    await expect(page.getByText('Discount applied')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).last().click();
    await page.getByText('Split').click();
    await expect(page.getByText('Split bill by item')).toBeVisible();
    await page.getByRole('button', { name: 'Assign to split' }).first().click();
    await expect(page.getByText(/assigned to split/)).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).last().click();
    await page.getByText('Fire').click();
    await expect(page.getByText('Fire order queued')).toBeVisible();
    await page.getByRole('button', { name: /Close|Tutup/ }).last().click();
    await page.getByText('Conflict').click();
    await expect(page.getByText('Conflict resolution')).toBeVisible();
    await page.getByRole('button', { name: 'Keep local' }).click();
    await expect(page.getByText('Local draft kept')).toBeVisible();
  });

  test('completes QRIS payment with manual reference and then opens receipt fallback', async ({ page }) => {
    await page.getByTestId('menu-item-menu-001').click();
    await page.getByText(/Add Rp/).click();
    await page.getByRole('button', { name: 'Pick destination', exact: true }).click();
    await page.getByLabel(/T1/).click();
    await page.getByText('Continue to pay').click();

    await page.getByRole('button', { name: /QRIS/ }).click();
    await expect(page.getByText('Reference is required for QRIS payments.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Complete with mock reference' })).toBeVisible();

    await page.locator('input').last().fill('QR-12345');
    await page.getByRole('button', { name: 'Complete payment' }).click();
    await expect(page.getByText('Pembayaran berhasil')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('QR-12345')).toBeVisible();
    await expect(page.getByText('Printer fallback', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Print receipt' }).click();
    await expect(page.getByText('Printer fallback', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Print later' }).click();
    await expect(page.getByText('Print queued')).toBeVisible();
  });

  test('completes E-wallet with a generated mock reference', async ({ page }) => {
    await page.getByTestId('menu-item-menu-001').click();
    await page.getByText(/Add Rp/).click();
    await page.getByRole('button', { name: 'Pick destination', exact: true }).click();
    await page.getByLabel(/T1/).click();
    await page.getByText('Continue to pay').click();

    await page.getByRole('button', { name: /E-wallet/ }).click();
    await expect(page.getByText('Reference is required for EWALLET payments.')).toBeVisible();
    await expect(page.getByText('Simulator will create a mock approval reference if you continue.')).toBeVisible();
    await page.getByRole('button', { name: 'Complete with mock reference' }).click();

    await expect(page.getByText('Pembayaran berhasil')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/EWALLET-MOCK-/)).toBeVisible();
    await page.getByRole('button', { name: /Send digital receipt|Kirim digital receipt/ }).click();
    await expect(page.getByText('Digital receipt queued')).toBeVisible();
    await page.getByRole('button', { name: /Close|Tutup/ }).last().click();
    await expect(page.getByRole('button', { name: 'New order' })).toBeVisible();
  });
});
