import { test, expect } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

test.describe('Cashier - History Screen', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'cashier');
    await page.getByText('Riwayat').first().click();
    await expect(page.getByText('History and receipts')).toBeVisible({ timeout: 10000 });
  });

  test('shows searchable order history and selected detail', async ({ page }) => {
    await expect(page.getByText('ORD-20260602-021').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /View order ORD-20260602-021/ })).toBeVisible();
    await expect(page.getByText('Sarah Lim', { exact: true })).toBeVisible();
    await expect(page.getByText('Detail')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Refund review', exact: true })).toBeVisible();
  });

  test('opens receipt detail and digital receipt action', async ({ page }) => {
    await page.getByText('View receipt').click();
    await expect(page.getByText('Receipt detail')).toBeVisible();
    await expect(page.getByText('Send receipt')).toBeVisible();
    await page.getByText('Send receipt').click();
    await expect(page.getByText('Receipt send queued')).toBeVisible();
  });

  test('confirms history quick actions', async ({ page }) => {
    await page.getByRole('button', { name: 'Reprint' }).click();
    await expect(page.getByText('Reprint queued')).toBeVisible();
    await page.getByRole('button', { name: /Close|Tutup/ }).last().click();

    await page.getByRole('button', { name: 'Digital receipt' }).click();
    await expect(page.getByText('Digital receipt queued')).toBeVisible();
    await page.getByRole('button', { name: /Close|Tutup/ }).last().click();

    await page.getByRole('button', { name: 'Refund review', exact: true }).click();
    await expect(page.getByText('Refund review queued')).toBeVisible();
  });
});
