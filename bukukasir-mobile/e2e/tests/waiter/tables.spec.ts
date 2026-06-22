import { test, expect } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

test.describe('Waiter - Redesigned Flows', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'waiter');
    await expect(page.getByText('Assigned tables')).toBeVisible({ timeout: 15000 });
  });

  test('shows assigned tables, bill request, and no payment controls', async ({ page }) => {
    await expect(page.getByText(/Pelayan:/)).toBeVisible();
    await expect(page.getByText('Take order')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bill request' })).toBeVisible();
    await expect(page.getByText('Waiters cannot take payment. Cashier handles bill, split, receipt, and void approval.')).toBeVisible();
    await page.getByRole('button', { name: 'Bill request' }).click();
    await expect(page.getByText('Bill request queued')).toBeVisible();
    await page.getByRole('button', { name: /Close|Tutup/ }).last().click();
  });

  test('queues handoff from assigned tables with visible feedback', async ({ page }) => {
    await page.getByRole('button', { name: /Handoff table|Handoff meja/ }).click();
    await expect(page.getByText('Table transfer')).toBeVisible();
    await page.getByRole('button', { name: 'Send transfer' }).click();
    await expect(page.getByText('Handoff queued')).toBeVisible();
  });

  test('opens waiter order entry and sends kitchen flow', async ({ page }) => {
    await page.getByText('Take order').click();
    await expect(page.getByText('Waiter order entry')).toBeVisible({ timeout: 10000 });
    const nasiGorengCard = page.getByTestId('waiter-menu-item-menu-001');
    await nasiGorengCard.click();
    await expect(page.getByText('Notes for kitchen')).toBeVisible();
    await page.getByText(/Add Rp/).click();
    await expect(nasiGorengCard).toHaveAttribute('aria-selected', 'true');
    await expect(nasiGorengCard).toHaveCSS('border-color', 'rgb(17, 24, 39)');
    await expect(page.getByText('Send to Kitchen')).toBeVisible();
    await expect(page.getByText("Waiters can't take payment — cashier handles that.")).toBeVisible();
  });

  test('explains missing table before waiter order actions run', async ({ page }) => {
    await page.goto('/?e2eRole=waiter&e2eTarget=order');
    await expect(page.getByText('No table selected')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Add customer|Tambah customer/ })).toHaveCount(0);

    await page.getByRole('button', { name: 'Bill request' }).click();
    await expect(page.getByText('Waiter update')).toBeVisible();
    await page.getByRole('button', { name: /Close|Tutup/ }).last().click();

    await page.getByRole('button', { name: 'Fire order' }).click();
    await expect(page.getByText('Waiter update')).toBeVisible();
    await page.getByRole('button', { name: /Close|Tutup/ }).last().click();

    await page.getByRole('button', { name: 'Choose table' }).click();
    await expect(page.getByText('Assigned tables')).toBeVisible({ timeout: 10000 });
  });

  test('supports waiter transfer accept and reject states', async ({ page }) => {
    await page.getByText('Transfer').first().click();
    await expect(page.getByText('Handoff meja').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Incoming transfer: T4 from Raka')).toBeVisible();
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(page.getByText('Transfer accepted')).toBeVisible();
    await page.getByRole('button', { name: /Close|Tutup/ }).last().click();
    await expect(page.getByText('Status: accepted')).toBeVisible();
    await page.getByRole('button', { name: 'Move back to pending' }).click();
    await expect(page.getByText('Moved back to pending')).toBeVisible();
    await page.getByRole('button', { name: /Close|Tutup/ }).last().click();
    await expect(page.getByText('Status: pending')).toBeVisible();
  });

  test('queues waiter transfer send with visible feedback', async ({ page }) => {
    await page.getByText('Transfer').first().click();
    await expect(page.getByText('Handoff meja').first()).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Send transfer' }).click();
    await expect(page.getByText('Transfer request queued')).toBeVisible();
    await expect(page.getByText(/T2 is queued for Dewi/)).toBeVisible();
  });
});
