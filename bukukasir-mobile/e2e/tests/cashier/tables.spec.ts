import { test, expect } from '@playwright/test';
import { loginAs } from '../../fixtures/auth';

test.describe('Cashier - Table Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'cashier');
    await page.getByText('Meja buka').first().click();
    await expect(page.getByText('Open tabs and floor plan')).toBeVisible({ timeout: 10000 });
  });

  test('shows open tabs and table management controls', async ({ page }) => {
    await expect(page.getByText('Sarah Lim')).toBeVisible();
    await expect(page.getByRole('button', { name: /Resume open tab T2, Sarah Lim/ })).toBeVisible();
    await expect(page.getByText('Atur denah meja')).toBeVisible();
    await expect(page.getByText('Merge tables')).toBeVisible();
    await expect(page.getByText('Pair printer')).toBeVisible();
  });

  test('shows floor layout and merge state', async ({ page }) => {
    await page.getByRole('button', { name: 'Floor' }).click();
    await expect(page.getByLabel(/T1/)).toBeVisible();
    await expect(page.getByText('78k')).toBeVisible();
    await page.getByRole('button', { name: 'Merge', exact: true }).click();
    await page.getByText('Merge selected').click();
    await expect(page.getByText(/setup pending\/local/).first()).toBeVisible();
  });

  test('opens table actions from floor tiles', async ({ page }) => {
    await page.getByRole('button', { name: 'Floor' }).click();
    await page.getByRole('button', { name: /^T2,/ }).first().click();
    await expect(page.getByText('T2 actions')).toBeVisible();
    await page.getByRole('button', { name: 'Transfer table' }).click();
    await expect(page.getByText('Transfer table')).toBeVisible();
    await expect(page.getByText('From T2 to T6')).toBeVisible();
  });

  test('pairs printer and queues print tracking', async ({ page }) => {
    await page.getByText('Pair printer').first().click();
    await expect(page.getByText('Pair printer').last()).toBeVisible();
    await page.getByText('Connect printer').click();
    await expect(page.getByText(/Printer|print/i).first()).toBeVisible();
  });
});

test.describe('Cashier - Table Transfer', () => {
  test('handles source and target selection with visible feedback', async ({ page }) => {
    await page.goto('/?e2eRole=cashier&e2eTarget=transfer&e2eLocale=en');
    await expect(page.getByText('Transfer table')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('From T2 to T6')).toBeVisible();

    await page.getByRole('button', { name: /^T2,/ }).first().click();
    await expect(page.getByText('Choose a different table')).toBeVisible();
    await page.getByText('Stay here').click();

    await page.getByRole('button', { name: 'Set source' }).click();
    await page.getByRole('button', { name: /^T3,/ }).first().click();
    await expect(page.getByText('From T3 to T6')).toBeVisible();

    await page.getByRole('button', { name: 'Set target' }).click();
    await page.getByRole('button', { name: /^T7,/ }).first().click();
    await expect(page.getByText('From T3 to T7')).toBeVisible();

    await page.getByText('Submit transfer').click();
    await expect(page.getByText('Transfer queued')).toBeVisible();
    await expect(page.getByText(/T3 is moving to T7/)).toBeVisible();
  });
});
